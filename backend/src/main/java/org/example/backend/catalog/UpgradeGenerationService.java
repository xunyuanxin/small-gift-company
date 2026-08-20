package org.example.backend.catalog;

import org.springframework.stereotype.Service;
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
