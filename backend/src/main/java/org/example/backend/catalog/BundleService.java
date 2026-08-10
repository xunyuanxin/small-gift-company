package org.example.backend.catalog;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class BundleService {

    private final BundleRepository repo;

    public BundleService(BundleRepository repo) {
        this.repo = repo;
    }

    public List<BundleDto> search(List<String> tags, BigDecimal maxPrice) {
        boolean hasTags  = tags != null && !tags.isEmpty();
        boolean hasPrice = maxPrice != null;

        List<Bundle> bundles;
        if (hasTags && hasPrice) {
            bundles = repo.findActiveByAllTagsAndMaxPrice(tags, tags.size(), maxPrice);
        } else if (hasTags) {
            bundles = repo.findActiveByAllTags(tags, tags.size());
        } else if (hasPrice) {
            bundles = repo.findActiveByMaxPrice(maxPrice);
        } else {
            bundles = repo.findAllActive();
        }

        return bundles.stream().map(BundleDto::from).toList();
    }

    public BundleDetailDto getDetail(Long id) {
        Bundle bundle = repo.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Bundle " + id + " not found"));
        return BundleDetailDto.from(bundle);
    }
}
