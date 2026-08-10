package org.example.backend.catalog;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "bundle")
public class Bundle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "bundle", fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    private List<BundleItem> items;

    @ElementCollection
    @CollectionTable(name = "bundle_tag", joinColumns = @JoinColumn(name = "bundle_id"))
    @Column(name = "tag", length = 50)
    @BatchSize(size = 100)
    private Set<String> tags = new HashSet<>();

    protected Bundle() {}

    public Long getId()            { return id; }
    public String getName()        { return name; }
    public String getDescription() { return description; }
    public BigDecimal getBasePrice(){ return basePrice; }
    public String getImageUrl()    { return imageUrl; }
    public boolean isActive()      { return active; }
    public List<BundleItem> getItems(){ return items; }
    public Set<String> getTags()   { return tags; }
}
