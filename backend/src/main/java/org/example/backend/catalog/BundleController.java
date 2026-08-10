package org.example.backend.catalog;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bundles")
@Validated
public class BundleController {

    private final BundleService service;

    public BundleController(BundleService service) {
        this.service = service;
    }

    /**
     * GET /api/bundles?tag=age:4-8&tag=interest:art&maxPrice=15.00
     *
     * <p>Returns active bundles matching ALL supplied tags (AND semantics)
     * and optionally capped at maxPrice. Tag list is bounded to 10 entries
     * to prevent excessive query parameters.
     */
    @GetMapping
    public ResponseEntity<List<BundleDto>> search(
            @RequestParam(required = false)
            @Size(max = 10, message = "At most 10 tags may be supplied")
            List<String> tag,

            @RequestParam(required = false)
            @DecimalMin(value = "0.01", message = "maxPrice must be greater than zero")
            BigDecimal maxPrice) {

        return ResponseEntity.ok(service.search(tag, maxPrice));
    }

    /**
     * GET /api/bundles/{id}
     *
     * <p>Returns full bundle detail including line items.
     * Returns 404 if the bundle does not exist or is inactive.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BundleDetailDto> detail(@PathVariable Long id) {
        return ResponseEntity.ok(service.getDetail(id));
    }
}
