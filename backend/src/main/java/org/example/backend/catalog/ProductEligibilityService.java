package org.example.backend.catalog;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProductEligibilityService {

    private final ProductOccasionRepository occasionRepository;

    public ProductEligibilityService(ProductOccasionRepository occasionRepository) {
        this.occasionRepository = occasionRepository;
    }

    /**
     * Filters a list of products to only those eligible for the given age and partyType.
     * Hard constraints only — no scoring.
     */
    public List<Product> filterEligible(int age, PartyType partyType, List<Product> candidates) {
        if (candidates.isEmpty()) {
            return List.of();
        }

        Set<Long> candidateIds = candidates.stream()
                .map(Product::getId)
                .collect(Collectors.toSet());

        List<ProductOccasion> occasions = occasionRepository.findAllByProductIdIn(candidateIds);

        Map<Long, Set<String>> occasionsByProductId = occasions.stream()
                .collect(Collectors.groupingBy(
                        ProductOccasion::getProductId,
                        Collectors.mapping(ProductOccasion::getOccasion, Collectors.toSet())
                ));

        return candidates.stream()
                .filter(p -> isEligible(p, age, partyType, occasionsByProductId))
                .toList();
    }

    /**
     * Checks eligibility using pre-loaded occasion map (avoids repeated DB calls).
     */
    public boolean isEligible(Product product, int age, PartyType partyType,
                               Map<Long, Set<String>> occasionsByProductId) {
        if (!product.isActive()) return false;
        if (age < product.getMinAge() || age > product.getMaxAge()) return false;
        if (product.getInventoryQuantity() <= 0) return false;

        Set<String> productOccasions = occasionsByProductId.getOrDefault(product.getId(), Set.of());
        return productOccasions.contains(partyType.name());
    }

    /**
     * Single-product eligibility check — performs its own DB call for occasions.
     */
    public boolean isEligible(Product product, int age, PartyType partyType) {
        if (!product.isActive()) return false;
        if (age < product.getMinAge() || age > product.getMaxAge()) return false;
        if (product.getInventoryQuantity() <= 0) return false;

        List<ProductOccasion> occasions = occasionRepository.findAllByProductIdIn(
                List.of(product.getId()));
        return occasions.stream().anyMatch(o -> o.getOccasion().equals(partyType.name()));
    }
}
