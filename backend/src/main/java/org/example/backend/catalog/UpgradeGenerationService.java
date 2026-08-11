package org.example.backend.catalog;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class UpgradeGenerationService {

    /**
     * Selects the best PREMIUM upgrade product, if any.
     *
     * Filters eligible products where:
     * - upgradeTier == PREMIUM
     * - id NOT in standardIds (already used in standard slots)
     * Scores by interest affinity only.
     * Returns the highest-scoring candidate, or Optional.empty() if none.
     */
    public Optional<Product> selectUpgrade(
            List<Product> eligible,
            Set<Long> standardIds,
            BundleGenerationRequest request,
            Map<Long, List<ProductInterestAffinity>> interestAffinitiesByProductId) {

        return eligible.stream()
                .filter(p -> p.getUpgradeTier() == UpgradeTier.PREMIUM)
                .filter(p -> !standardIds.contains(p.getId()))
                .max((a, b) -> {
                    int scoreA = interestScore(a.getId(), request.interest(), interestAffinitiesByProductId);
                    int scoreB = interestScore(b.getId(), request.interest(), interestAffinitiesByProductId);
                    return Integer.compare(scoreA, scoreB);
                });
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
