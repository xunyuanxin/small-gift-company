package org.example.backend.catalog;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BundleTemplateRepository extends JpaRepository<BundleTemplate, Long> {

    Optional<BundleTemplate> findByCode(String code);

    Optional<BundleTemplate> findByCodeAndActiveTrue(String code);
}
