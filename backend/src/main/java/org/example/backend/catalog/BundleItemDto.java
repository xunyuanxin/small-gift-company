package org.example.backend.catalog;

import java.math.BigDecimal;

public record BundleItemDto(
        String sku,
        String name,
        int    quantityPerBundle,
        boolean replaceable,
        BigDecimal unitCost
) {
    static BundleItemDto from(BundleItem item) {
        Product p = item.getProduct();
        return new BundleItemDto(
                p.getSku(),
                p.getName(),
                item.getQuantityPerBundle(),
                item.isReplaceable(),
                p.getUnitCost()
        );
    }
}
