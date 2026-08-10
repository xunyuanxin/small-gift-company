package org.example.backend.catalog;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

/** Lightweight summary used in the gift-finder list response. */
public record BundleDto(
        Long       id,
        String     name,
        String     description,
        BigDecimal basePrice,
        String     imageUrl,
        Set<String> tags
) {
    static BundleDto from(Bundle b) {
        return new BundleDto(b.getId(), b.getName(), b.getDescription(),
                b.getBasePrice(), b.getImageUrl(), new HashSet<>(b.getTags()));
    }
}
