package org.example.backend.catalog;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class UpgradeGenerationService {

    public record UpgradeSelection(Optional<Product> standardProduct, Optional<Product> premiumProduct) {}

    /**
     * Selects the best STANDARD and PREMIUM upgrade products.
     *
     * Premium: filter upgradeTier == PREMIUM, not in standardIds, pick highest interest score.
     * Standard: filter upgradeTier == STANDARD, not in standardIds, not same as premium, pick highest interest score.
     */
    public UpgradeSelection selectUpgrades(
            List<Product> eligible,
            Set<Long> standardIds,
            BundleGenerationRequest request,
            Map<Long, List<ProductInterestAffinity>> interestAffinitiesByProductId) {

        Optional<Product> premiumOpt = eligible.stream()
                .filter(p -> p.getUpgradeTier() == UpgradeTier.PREMIUM)
                .filter(p -> !standardIds.contains(p.getId()))
                .max((a, b) -> {
                    int scoreA = interestScore(a.getId(), request.interest(), interestAffinitiesByProductId);
                    int scoreB = interestScore(b.getId(), request.interest(), interestAffinitiesByProductId);
                    return Integer.compare(scoreA, scoreB);
                });

        final Long premiumId = premiumOpt.map(Product::getId).orElse(null);

        Optional<Product> standardOpt = eligible.stream()
                .filter(p -> p.getUpgradeTier() == UpgradeTier.STANDARD)
                .filter(p -> !standardIds.contains(p.getId()))
                .filter(p -> premiumId == null || !p.getId().equals(premiumId))
                .max((a, b) -> {
                    int scoreA = interestScore(a.getId(), request.interest(), interestAffinitiesByProductId);
                    int scoreB = interestScore(b.getId(), request.interest(), interestAffinitiesByProductId);
                    return Integer.compare(scoreA, scoreB);
                });

        return new UpgradeSelection(standardOpt, premiumOpt);
    }

    /**
     * Price-ceiling variant: standard upgrade must fit within remainingRetailBudget.
     * Premium upgrade has no budget constraint (it is an explicit opt-in above the ceiling).
     */
    public UpgradeSelection selectUpgradesWithinRetailBudget(
            List<Product> allActive,
            Set<Long> selectedIds,
            BundleGenerationRequest request,
            Map<Long, List<ProductInterestAffinity>> interestAffinitiesByProductId,
            BigDecimal remainingRetailBudget) {

        Optional<Product> standardOpt = allActive.stream()
                .filter(p -> p.getUpgradeTier() == UpgradeTier.STANDARD)
                .filter(p -> !selectedIds.contains(p.getId()))
                .filter(p -> p.getRetailPrice().compareTo(remainingRetailBudget) <= 0)
                .max((a, b) -> Integer.compare(
                        interestScore(a.getId(), request.interest(), interestAffinitiesByProductId),
                        interestScore(b.getId(), request.interest(), interestAffinitiesByProductId)));

        final Long standardId = standardOpt.map(Product::getId).orElse(null);

        Optional<Product> premiumOpt = allActive.stream()
                .filter(p -> p.getUpgradeTier() == UpgradeTier.PREMIUM)
                .filter(p -> !selectedIds.contains(p.getId()))
                .filter(p -> standardId == null || !p.getId().equals(standardId))
                .max((a, b) -> Integer.compare(
                        interestScore(a.getId(), request.interest(), interestAffinitiesByProductId),
                        interestScore(b.getId(), request.interest(), interestAffinitiesByProductId)));

        return new UpgradeSelection(standardOpt, premiumOpt);
    }

    /**
     * Ceiling-optimization variant for the constrained path:
     * - Standard: from eligible STANDARD (not selected), retail ≤ remaining, pick the one
     *   with the highest retail price (brings total closest to the ceiling).
     * - Premium: from eligible PREMIUM (not selected), pick the cheapest.
     */
    public UpgradeSelection selectUpgradesForCeilingPath(
            List<Product> eligible,
            Set<Long> selectedIds,
            BigDecimal remaining) {

        Optional<Product> standardOpt = eligible.stream()
                .filter(p -> p.getUpgradeTier() == UpgradeTier.STANDARD)
                .filter(p -> !selectedIds.contains(p.getId()))
                .filter(p -> p.getRetailPrice().compareTo(remaining) <= 0)
                .max(Comparator.comparing(Product::getRetailPrice));

        final Long standardId = standardOpt.map(Product::getId).orElse(null);

        Optional<Product> premiumOpt = eligible.stream()
                .filter(p -> p.getUpgradeTier() == UpgradeTier.PREMIUM)
                .filter(p -> !selectedIds.contains(p.getId()))
                .filter(p -> standardId == null || !p.getId().equals(standardId))
                .min(Comparator.comparing(Product::getRetailPrice));

        return new UpgradeSelection(standardOpt, premiumOpt);
    }

    private int interestScore(Long productId, Interest interest,
                               Map<Long, List<ProductInterestAffinity>> affinities) {
        List<ProductInterestAffinity> productAffinities = affinities.getOrDefault(productId, List.of());
        return productAffinities.stream()
                .filter(a -> a.getInterest().equals(interest.name()))
                .mapToInt(a -> a.getWeight())
                .findFirst()
                .orElse(0);
    }
}
