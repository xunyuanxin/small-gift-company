package org.example.backend.catalog;

public record BundleItemDto(
        String  sku,
        String  name,
        int     quantityPerBundle,
        boolean replaceable
        // unitCost intentionally absent — internal pricing must not be exposed publicly
) {
    static BundleItemDto from(BundleItem item) {
        Product p = item.getProduct();
        return new BundleItemDto(p.getSku(), p.getName(),
                item.getQuantityPerBundle(), item.isReplaceable());
    }
}
