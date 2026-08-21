package org.example.backend.admin;

import org.example.backend.analytics.AnalyticsEventRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/api/dashboard")
public class AdminDashboardController {

    private final AnalyticsEventRepository analyticsEventRepository;

    public AdminDashboardController(AnalyticsEventRepository analyticsEventRepository) {
        this.analyticsEventRepository = analyticsEventRepository;
    }

    record DashboardDto(long finderCompletions, long bundleViews) {}

    @GetMapping("/")
    public DashboardDto getDashboard() {
        long finderCompletions = analyticsEventRepository.countByEventType("FINDER_COMPLETED");
        long bundleViews = analyticsEventRepository.countByEventType("BUNDLE_VIEWED");
        return new DashboardDto(finderCompletions, bundleViews);
    }
}
