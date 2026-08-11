package org.example.backend.catalog;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "generated_bundle_upgrade")
public class GeneratedBundleUpgrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "generated_bundle_id", nullable = false)
    private GeneratedBundle generatedBundle;

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_name_snapshot", length = 100)
    private String productNameSnapshot;

    @Column(name = "sku_snapshot", length = 50)
    private String skuSnapshot;

    @Column(name = "cost_snapshot", precision = 10, scale = 2)
    private BigDecimal costSnapshot;

    @Column(name = "retail_price_adjustment_snapshot", precision = 10, scale = 2)
    private BigDecimal retailPriceAdjustmentSnapshot = BigDecimal.ZERO;

    protected GeneratedBundleUpgrade() {}

    public GeneratedBundleUpgrade(GeneratedBundle generatedBundle) {
        this.generatedBundle = generatedBundle;
    }

    public GeneratedBundleUpgrade(GeneratedBundle generatedBundle, Product product) {
        this.generatedBundle = generatedBundle;
        this.productId = product.getId();
        this.productNameSnapshot = product.getName();
        this.skuSnapshot = product.getSku();
        this.costSnapshot = product.getCost();
        this.retailPriceAdjustmentSnapshot = BigDecimal.ZERO;
    }

    public Long getId()                                        { return id; }
    public GeneratedBundle getGeneratedBundle()                { return generatedBundle; }
    public Long getProductId()                                 { return productId; }
    public String getProductNameSnapshot()                     { return productNameSnapshot; }
    public String getSkuSnapshot()                             { return skuSnapshot; }
    public BigDecimal getCostSnapshot()                        { return costSnapshot; }
    public BigDecimal getRetailPriceAdjustmentSnapshot()       { return retailPriceAdjustmentSnapshot; }
}
