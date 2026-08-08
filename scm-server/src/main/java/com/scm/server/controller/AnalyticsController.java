package com.scm.server.controller;

import com.scm.server.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<com.scm.server.dto.FinancialMetricsDTO> getFinancialMetrics() {
        return ResponseEntity.ok(analyticsService.getFinancialMetrics());
    }

    @GetMapping("/trends")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<java.util.Map<String, java.math.BigDecimal>> getRevenueTrends(
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getRevenueTrends(days));
    }

    @GetMapping("/inventory/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<java.util.List<com.scm.server.model.Product>> getLowStockProducts() {
        return ResponseEntity.ok(analyticsService.getLowStockProducts());
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<java.util.List<java.util.Map<String, Object>>> getCategoryDistribution() {
        return ResponseEntity.ok(analyticsService.getCategoryDistribution());
    }
}
