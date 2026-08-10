package org.example.backend.catalog;

import jakarta.persistence.*;

@Entity
@Table(name = "bundle_item")
public class BundleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bundle_id", nullable = false)
    private Bundle bundle;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity_per_bundle", nullable = false)
    private int quantityPerBundle = 1;

    @Column(nullable = false)
    private boolean replaceable = false;

    protected BundleItem() {}

    public Long getId()               { return id; }
    public Bundle getBundle()         { return bundle; }
    public Product getProduct()       { return product; }
    public int getQuantityPerBundle() { return quantityPerBundle; }
    public boolean isReplaceable()    { return replaceable; }
}
