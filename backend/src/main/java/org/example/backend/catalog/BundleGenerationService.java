package org.example.backend.catalog;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BundleGenerationService {


    private final BudgetTierRepository budgetTierRepository;
    private final ProductRepository productRepository;
    private final ProductInterestAffinityRepository interestAffinityRepository;
    private final ProductAudienceAffinityRepository audienceAffinityRepository;
    private final ProductOccasionRepository occasionRepository;
    private final ProductRoleAffinityRepository roleAffinityRepository;
    private final ProductEligibilityService eligibilityService;
    private final ProductScoringService scoringService;
    private final BundleTemplateSelector templateSelector;
    private final UpgradeGenerationService upgradeGenerationService;
    private final GiftBagOptionRepository giftBagOptionRepository;
    private final GeneratedBundleRepository generatedBundleRepository;

    public BundleGenerationService(
            BudgetTierRepository budgetTierRepository,
            ProductRepository productRepository,
            ProductInterestAffinityRepository interestAffinityRepository,
            ProductAudienceAffinityRepository audienceAffinityRepository,
            ProductOccasionRepository occasionRepository,
            ProductRoleAffinityRepository roleAffinityRepository,
            ProductEligibilityService eligibilityService,
            ProductScoringService scoringService,
            BundleTemplateSelector templateSelector,
            UpgradeGenerationService upgradeGenerationService,
            GiftBagOptionRepository giftBagOptionRepository,
            GeneratedBundleRepository generatedBundleRepository) {
        this.budgetTierRepository = budgetTierRepository;
        this.productRepository = productRepository;
        this.interestAffinityRepository = interestAffinityRepository;
        this.audienceAffinityRepository = audienceAffinityRepository;
        this.occasionRepository = occasionRepository;
        this.roleAffinityRepository = roleAffinityRepository;
        this.eligibilityService = eligibilityService;
        this.scoringService = scoringService;
        this.templateSelector = templateSelector;
        this.upgradeGenerationService = upgradeGenerationService;
        this.giftBagOptionRepository = giftBagOptionRepository;
        this.generatedBundleRepository = generatedBundleRepository;
    }

    /**
     * Generates and persists a complete bundle snapshot atomically.
     */
    @Transactional
    public GeneratedBundle generate(BundleGenerationRequest request) {
        // 1. Load and validate BudgetTier
        BudgetTier budgetTier = budgetTierRepository.findByCodeAndActiveTrue(request.budgetTierCode())
                .orElseThrow(() -> new BundleGenerationException(
                        BundleGenerationException.FailureCode.BUDGET_TIER_NOT_FOUND,
                        "Budget tier not found or inactive: " + request.budgetTierCode()));

        // 2. Select BundleTemplate
        BundleTemplate template = templateSelector.selectTemplate(request.age(), request.interest());

        // Eagerly initialize slots (EAGER fetch on allowedRoles is set on BundleTemplateSlot)
        List<BundleTemplateSlot> slots = template.getSlots();
        // Force initialization of allowedRoles for each slot
        slots.forEach(s -> s.getAllowedRoles().size());

        // 3. Load all active products
        List<Product> allActive = productRepository.findAllByActiveTrue();

        // 4. Pre-load all affinities in batch
        Set<Long> allProductIds = allActive.stream().map(Product::getId).collect(Collectors.toSet());

        List<ProductInterestAffinity> allInterestAffinities =
                interestAffinityRepository.findAllByProductIdIn(allProductIds);
        List<ProductAudienceAffinity> allAudienceAffinities =
                audienceAffinityRepository.findAllByProductIdIn(allProductIds);
        List<ProductOccasion> allOccasions =
                occasionRepository.findAllByProductIdIn(allProductIds);
        List<ProductRoleAffinity> allRoleAffinities =
                roleAffinityRepository.findAllByProductIdIn(allProductIds);

        // Build lookup maps
        Map<Long, List<ProductInterestAffinity>> interestByProduct = allInterestAffinities.stream()
                .collect(Collectors.groupingBy(ProductInterestAffinity::getProductId));
        Map<Long, List<ProductAudienceAffinity>> audienceByProduct = allAudienceAffinities.stream()
                .collect(Collectors.groupingBy(ProductAudienceAffinity::getProductId));
        Map<Long, Set<String>> occasionsByProduct = allOccasions.stream()
                .collect(Collectors.groupingBy(
                        ProductOccasion::getProductId,
                        Collectors.mapping(ProductOccasion::getOccasion, Collectors.toSet())));
        Map<Long, List<ProductRoleAffinity>> roleByProduct = allRoleAffinities.stream()
                .collect(Collectors.groupingBy(ProductRoleAffinity::getProductId));

        // 5. Filter eligible products
        List<Product> eligible = allActive.stream()
                .filter(p -> eligibilityService.isEligible(p, request.age(),
                        request.partyType(), occasionsByProduct))
                .toList();

        if (eligible.isEmpty()) {
            throw new BundleGenerationException(
                    BundleGenerationException.FailureCode.NO_ELIGIBLE_PRODUCTS,
                    "No eligible products for request");
        }

        // 6. Greedy slot-based selection (pure in-memory — no DB writes yet)
        BigDecimal remainingCogs = budgetTier.getMaxItemCogs();
        Set<Long> selectedIds = new HashSet<>();
        // selectedProducts in slot order — used to build items after COGS is known
        List<SlotSelection> slotSelections = new ArrayList<>();

        for (int slotIdx = 0; slotIdx < slots.size(); slotIdx++) {
            BundleTemplateSlot slot = slots.get(slotIdx);
            final BigDecimal currentRemaining = remainingCogs;

            List<BundleTemplateSlot> remainingSlots = slots.subList(slotIdx + 1, slots.size());

            // Candidates: eligible, not yet selected, within budget, has any allowed role
            List<Product> candidates = eligible.stream()
                    .filter(p -> !selectedIds.contains(p.getId()))
                    .filter(p -> p.getCost().compareTo(currentRemaining) <= 0)
                    .filter(p -> hasAnyRole(p.getId(), slot.getAllowedRoles(), roleByProduct))
                    .toList();

            if (candidates.isEmpty()) {
                throw new BundleGenerationException(
                        BundleGenerationException.FailureCode.INSUFFICIENT_ROLE_COVERAGE,
                        "No candidates for slot: " + slot.getSlotCode());
            }

            // Score descending
            List<Product> scored = candidates.stream()
                    .sorted((a, b) -> {
                        int scoreA = scoringService.score(a, slot, request,
                                interestByProduct.getOrDefault(a.getId(), List.of()),
                                audienceByProduct.getOrDefault(a.getId(), List.of()),
                                roleByProduct.getOrDefault(a.getId(), List.of()));
                        int scoreB = scoringService.score(b, slot, request,
                                interestByProduct.getOrDefault(b.getId(), List.of()),
                                audienceByProduct.getOrDefault(b.getId(), List.of()),
                                roleByProduct.getOrDefault(b.getId(), List.of()));
                        return Integer.compare(scoreB, scoreA);
                    })
                    .toList();

            // Find first feasible choice
            Product chosen = null;
            for (Product candidate : scored) {
                BigDecimal afterChoice = currentRemaining.subtract(candidate.getCost());
                if (isFeasible(afterChoice, remainingSlots, eligible, selectedIds,
                        candidate.getId(), roleByProduct)) {
                    chosen = candidate;
                    break;
                }
            }

            if (chosen == null) {
                throw new BundleGenerationException(
                        BundleGenerationException.FailureCode.NO_BUDGET_FEASIBLE,
                        "Cannot satisfy budget constraint for slot: " + slot.getSlotCode());
            }

            slotSelections.add(new SlotSelection(slot, chosen));
            selectedIds.add(chosen.getId());
            remainingCogs = remainingCogs.subtract(chosen.getCost());
        }

        // Calculate total COGS
        BigDecimal totalCogs = slotSelections.stream()
                .map(s -> s.product().getCost())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 7. Select upgrades (standard + premium)
        UpgradeGenerationService.UpgradeSelection upgradeSelection = upgradeGenerationService.selectUpgrades(
                eligible, selectedIds, request, interestByProduct);

        // 8. Select default gift bag
        GiftBagOption giftBagOption = giftBagOptionRepository.findByIsDefaultTrue()
                .orElseThrow(() -> new BundleGenerationException(
                        BundleGenerationException.FailureCode.NO_GIFT_BAG_CONFIGURED,
                        "No default gift bag option configured"));

        // 9. Persist the full snapshot atomically
        String publicId = "gb_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        GeneratedBundle bundle = new GeneratedBundle(
                publicId,
                request.age().shortValue(),
                request.audiencePreference(),
                request.interest(),
                request.partyType(),
                budgetTier,
                template,
                totalCogs
        );

        // Set base retail price = sum of selected item retail prices
        BigDecimal baseRetailPrice = slotSelections.stream()
                .map(s -> s.product().getRetailPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        bundle.setBaseRetailPrice(baseRetailPrice);

        // Save bundle first to get its PK
        final GeneratedBundle savedBundle = generatedBundleRepository.save(bundle);

        // Build and save items
        List<GeneratedBundleItem> items = new ArrayList<>();
        for (SlotSelection selection : slotSelections) {
            items.add(new GeneratedBundleItem(
                    savedBundle, selection.slot().getSlotCode(),
                    selection.product(), selection.slot().getDisplayOrder()));
        }

        // Build upgrade based on which products were selected
        Optional<Product> standardOpt = upgradeSelection.standardProduct();
        Optional<Product> premiumOpt = upgradeSelection.premiumProduct();

        GeneratedBundleUpgrade upgrade;
        if (standardOpt.isPresent() && premiumOpt.isPresent()) {
            BigDecimal standardRetailPrice = standardOpt.get().getRetailPrice();
            BigDecimal upgradeDelta = premiumOpt.get().getRetailPrice().subtract(standardRetailPrice);
            upgrade = new GeneratedBundleUpgrade(
                    savedBundle,
                    standardOpt.get(), standardRetailPrice,
                    premiumOpt.get(), upgradeDelta);
        } else if (standardOpt.isPresent()) {
            upgrade = new GeneratedBundleUpgrade(
                    savedBundle, standardOpt.get(), standardOpt.get().getRetailPrice());
        } else {
            upgrade = new GeneratedBundleUpgrade(savedBundle);
        }

        GeneratedBundleGiftBag giftBag = new GeneratedBundleGiftBag(savedBundle, giftBagOption);

        // Attach children — cascade will persist them on next save
        savedBundle.setItems(items);
        savedBundle.setUpgrade(upgrade);
        savedBundle.setGiftBag(giftBag);

        // Re-save to cascade-persist children
        generatedBundleRepository.save(savedBundle);

        // Return fully-loaded entity
        return generatedBundleRepository.findByPublicId(publicId).orElseThrow();
    }

    private boolean hasAnyRole(Long productId, Set<String> allowedRoles,
                                Map<Long, List<ProductRoleAffinity>> roleByProduct) {
        List<ProductRoleAffinity> roles = roleByProduct.getOrDefault(productId, List.of());
        return roles.stream().anyMatch(r -> allowedRoles.contains(r.getRole()));
    }

    /**
     * Feasibility check: after picking a candidate, can each remaining slot still be satisfied?
     * For each remaining slot, at least one eligible product must exist that:
     * - is not already selected (including the candidate just chosen)
     * - has cost <= remaining budget after the candidate's cost
     * - has any allowed role for that slot
     *
     * Note: we use a single shared remaining budget across all remaining slots (optimistic).
     * This prevents the algorithm from running out of budget before all slots are filled.
     */
    private boolean isFeasible(BigDecimal remainingAfterChoice,
                                List<BundleTemplateSlot> remainingSlots,
                                List<Product> eligible,
                                Set<Long> currentSelectedIds,
                                Long candidateId,
                                Map<Long, List<ProductRoleAffinity>> roleByProduct) {
        Set<Long> projectedSelected = new HashSet<>(currentSelectedIds);
        projectedSelected.add(candidateId);

        for (BundleTemplateSlot remainingSlot : remainingSlots) {
            final Set<Long> takenIds = new HashSet<>(projectedSelected);

            boolean anyFit = eligible.stream()
                    .filter(p -> !takenIds.contains(p.getId()))
                    .filter(p -> p.getCost().compareTo(remainingAfterChoice) <= 0)
                    .anyMatch(p -> hasAnyRole(p.getId(), remainingSlot.getAllowedRoles(), roleByProduct));

            if (!anyFit) return false;
        }

        return true;
    }

    /** Simple value record to carry slot + chosen product together. */
    private record SlotSelection(BundleTemplateSlot slot, Product product) {}
}
