package org.example.backend.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BundleRepository extends JpaRepository<Bundle, Long> {

    /** All active bundles — used when no tag filter is applied. */
    @Query("SELECT b FROM Bundle b WHERE b.active = true ORDER BY b.id")
    List<Bundle> findAllActive();

    /** Active bundles with ALL the requested tags (AND semantics). */
    @Query("""
            SELECT b FROM Bundle b
            WHERE  b.active = true
              AND  (SELECT COUNT(bt)
                    FROM   Bundle b2
                    JOIN   b2.tags bt
                    WHERE  b2 = b AND bt IN :tags) = :tagCount
            ORDER BY b.id
            """)
    List<Bundle> findActiveByAllTags(@Param("tags") List<String> tags,
                                     @Param("tagCount") long tagCount);

    /** Active bundles whose base_price is at or below the given ceiling. */
    @Query("SELECT b FROM Bundle b WHERE b.active = true AND b.basePrice <= :max ORDER BY b.id")
    List<Bundle> findActiveByMaxPrice(@Param("max") BigDecimal max);

    /** Active bundles with ALL tags AND price ceiling (combined filter). */
    @Query("""
            SELECT b FROM Bundle b
            WHERE  b.active = true
              AND  b.basePrice <= :max
              AND  (SELECT COUNT(bt)
                    FROM   Bundle b2
                    JOIN   b2.tags bt
                    WHERE  b2 = b AND bt IN :tags) = :tagCount
            ORDER BY b.id
            """)
    List<Bundle> findActiveByAllTagsAndMaxPrice(@Param("tags") List<String> tags,
                                                @Param("tagCount") long tagCount,
                                                @Param("max") BigDecimal max);

    Optional<Bundle> findByIdAndActiveTrue(Long id);
}
