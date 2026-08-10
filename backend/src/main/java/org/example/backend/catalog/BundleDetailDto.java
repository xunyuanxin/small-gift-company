package org.example.backend.catalog;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** Full detail used on the bundle-detail page. */
public record BundleDetailDto(
        Long             id,
        String           name,
        String           description,
        BigDecimal       basePrice,
        String           imageUrl,
        Set<String>      tags,
        List<BundleItemDto> items
) {
    static BundleDetailDto from(Bundle b) {
        List<BundleItemDto> itemDtos = b.getItems().stream()
                .map(BundleItemDto::from)
                .toList();
        return new BundleDetailDto(b.getId(), b.getName(), b.getDescription(),
                b.getBasePrice(), b.getImageUrl(), new HashSet<>(b.getTags()), itemDtos);
    }
}
