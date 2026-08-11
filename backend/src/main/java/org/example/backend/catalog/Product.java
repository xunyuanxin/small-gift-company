package org.example.backend.catalog;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(name = "inventory_quantity", nullable = false)
    private int inventoryQuantity;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "min_age", nullable = false)
    private short minAge;

    @Column(name = "max_age", nullable = false)
    private short maxAge;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProductCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "form_factor", nullable = false, length = 30)
    private FormFactor formFactor;

    @Enumerated(EnumType.STRING)
    @Column(name = "upgrade_tier", nullable = false, length = 20)
    private UpgradeTier upgradeTier;

    @Column(name = "theme_code", length = 50)
    private String themeCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Product() {}

    public Long getId()                    { return id; }
    public String getSku()                 { return sku; }
    public String getName()                { return name; }
    public String getDescription()         { return description; }
    public String getImageUrl()            { return imageUrl; }
    public BigDecimal getCost()            { return cost; }
    public int getInventoryQuantity()      { return inventoryQuantity; }
    public boolean isActive()              { return active; }
    public short getMinAge()               { return minAge; }
    public short getMaxAge()               { return maxAge; }
    public ProductCategory getCategory()   { return category; }
    public FormFactor getFormFactor()      { return formFactor; }
    public UpgradeTier getUpgradeTier()    { return upgradeTier; }
    public String getThemeCode()           { return themeCode; }
    public Instant getCreatedAt()          { return createdAt; }
    public Instant getUpdatedAt()          { return updatedAt; }
}
