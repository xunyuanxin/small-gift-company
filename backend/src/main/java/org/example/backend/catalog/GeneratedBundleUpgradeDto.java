package org.example.backend.catalog;

import java.math.BigDecimal;

public record GeneratedBundleUpgradeDto(
        String productName,
        String sku,
        BigDecimal retailPriceAdjustment
) {
    public static GeneratedBundleUpgradeDto from(GeneratedBundleUpgrade upgrade) {
        if (upgrade == null || upgrade.getProductNameSnapshot() == null) {
            return null;
        }
        return new GeneratedBundleUpgradeDto(
                upgrade.getProductNameSnapshot(),
                upgrade.getSkuSnapshot(),
                upgrade.getRetailPriceAdjustmentSnapshot()
        );
    }
}
