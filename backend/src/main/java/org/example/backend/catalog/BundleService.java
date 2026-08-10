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
        // Deduplicate before counting — duplicate tag values in the IN clause would make
        // the correlated subquery COUNT mismatch the tagCount argument and return no results.
        List<String> effectiveTags = (tags == null) ? List.of()
                : tags.stream().distinct().toList();
        boolean hasTags  = !effectiveTags.isEmpty();
        boolean hasPrice = maxPrice != null;

        List<Bundle> bundles;
        if (hasTags && hasPrice) {
            bundles = repo.findActiveByAllTagsAndMaxPrice(effectiveTags, effectiveTags.size(), maxPrice);
        } else if (hasTags) {
            bundles = repo.findActiveByAllTags(effectiveTags, effectiveTags.size());
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
