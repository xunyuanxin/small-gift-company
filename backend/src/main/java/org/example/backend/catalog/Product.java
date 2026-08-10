package org.example.backend.catalog;

import jakarta.persistence.*;
import java.math.BigDecimal;

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

    @Column(name = "unit_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitCost;

    @Column(name = "inventory_quantity", nullable = false)
    private int inventoryQuantity;

    @Column(nullable = false)
    private boolean active = true;

    protected Product() {}

    public Long getId()               { return id; }
    public String getSku()            { return sku; }
    public String getName()           { return name; }
    public String getDescription()    { return description; }
    public String getImageUrl()       { return imageUrl; }
    public BigDecimal getUnitCost()   { return unitCost; }
    public int getInventoryQuantity() { return inventoryQuantity; }
    public boolean isActive()         { return active; }
}
