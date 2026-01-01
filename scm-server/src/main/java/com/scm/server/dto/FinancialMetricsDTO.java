package com.scm.server.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class FinancialMetricsDTO {
    private BigDecimal totalRevenue;
    private BigDecimal cogs; // Cost of Goods Sold
    private BigDecimal grossProfit;
    private BigDecimal netMarginPercentage;
    private BigDecimal averageOrderValue;
    private BigDecimal inventoryValuation;

    // Additional breakdown data
    private Map<String, BigDecimal> revenueTrend; // e.g., "2023-10-01" -> 1500.00
    private Map<String, BigDecimal> profitTrend;
    private List<ProductPerformanceDTO> topProducts;

    @Data
    @Builder
    public static class ProductPerformanceDTO {
        private String productName;
        private BigDecimal revenue;
        private BigDecimal profit;
        private BigDecimal marginPercentage;
    }
}
