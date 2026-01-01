package com.scm.server.service;

import com.scm.server.repository.OrderRepository;
import com.scm.server.repository.ProductRepository;
import com.scm.server.repository.SupplierRepository;
import com.scm.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final SupplierRepository supplierRepository;
        private final UserRepository userRepository;

        public Map<String, Object> getSummary() {
                return new HashMap<>(); // Deprecated, redirect to getFinancialSummary
        }

        public com.scm.server.dto.FinancialMetricsDTO getFinancialMetrics() {
                List<com.scm.server.model.Order> orders = orderRepository.findAll();
                List<com.scm.server.model.Product> products = productRepository.findAll();

                java.math.BigDecimal totalRevenue = java.math.BigDecimal.ZERO;
                java.math.BigDecimal totalCost = java.math.BigDecimal.ZERO;

                // Calculate Revenue and COGS
                for (com.scm.server.model.Order order : orders) {
                        totalRevenue = totalRevenue
                                        .add(order.getTotalAmount() != null ? order.getTotalAmount()
                                                        : java.math.BigDecimal.ZERO);
                        for (com.scm.server.model.OrderItem item : order.getItems()) {
                                java.math.BigDecimal itemCost = item.getCost() != null ? item.getCost()
                                                : java.math.BigDecimal.ZERO;
                                totalCost = totalCost.add(
                                                itemCost.multiply(java.math.BigDecimal.valueOf(item.getQuantity())));
                        }
                }

                java.math.BigDecimal grossProfit = totalRevenue.subtract(totalCost);
                java.math.BigDecimal netMargin = totalRevenue.compareTo(java.math.BigDecimal.ZERO) > 0
                                ? grossProfit.divide(totalRevenue, 4, java.math.RoundingMode.HALF_UP)
                                                .multiply(java.math.BigDecimal.valueOf(100))
                                : java.math.BigDecimal.ZERO;

                java.math.BigDecimal inventoryValuation = products.stream()
                                .map(p -> (p.getCostPrice() != null ? p.getCostPrice() : java.math.BigDecimal.ZERO)
                                                .multiply(java.math.BigDecimal.valueOf(p.getQuantity())))
                                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                java.math.BigDecimal avgOrderValue = orders.isEmpty()
                                ? java.math.BigDecimal.ZERO
                                : totalRevenue.divide(java.math.BigDecimal.valueOf(orders.size()), 2,
                                                java.math.RoundingMode.HALF_UP);

                // Product Performance
                List<com.scm.server.dto.FinancialMetricsDTO.ProductPerformanceDTO> productPerformance = new java.util.ArrayList<>();
                // Simple aggregation (in real app, use SQL grouping)
                Map<String, com.scm.server.dto.FinancialMetricsDTO.ProductPerformanceDTO.ProductPerformanceDTOBuilder> perfMap = new HashMap<>();

                for (com.scm.server.model.Order order : orders) {
                        for (com.scm.server.model.OrderItem item : order.getItems()) {
                                String productName = item.getProduct().getName();
                                perfMap.putIfAbsent(productName,
                                                com.scm.server.dto.FinancialMetricsDTO.ProductPerformanceDTO.builder()
                                                                .productName(productName)
                                                                .revenue(java.math.BigDecimal.ZERO)
                                                                .profit(java.math.BigDecimal.ZERO));

                                var builder = perfMap.get(productName);
                                java.math.BigDecimal rev = item.getUnitPrice()
                                                .multiply(java.math.BigDecimal.valueOf(item.getQuantity()));
                                java.math.BigDecimal cst = (item.getCost() != null ? item.getCost()
                                                : java.math.BigDecimal.ZERO)
                                                .multiply(java.math.BigDecimal.valueOf(item.getQuantity()));

                                // How to update builder fields? Builder is not mutable in state usually.
                                // Hack for simplicity: Store values in a temporary object or just recalculate
                        }
                }

                // Re-doing Product Performance cleanly
                // Using a Map<ProductName, Stats>
                class ProdStats {
                        java.math.BigDecimal revenue = java.math.BigDecimal.ZERO;
                        java.math.BigDecimal cost = java.math.BigDecimal.ZERO;
                }
                Map<String, ProdStats> statsMap = new HashMap<>();

                for (com.scm.server.model.Order order : orders) {
                        for (com.scm.server.model.OrderItem item : order.getItems()) {
                                String name = item.getProduct().getName();
                                statsMap.putIfAbsent(name, new ProdStats());
                                ProdStats s = statsMap.get(name);
                                s.revenue = s.revenue
                                                .add(item.getUnitPrice().multiply(
                                                                java.math.BigDecimal.valueOf(item.getQuantity())));
                                java.math.BigDecimal itemCost = item.getCost() != null ? item.getCost()
                                                : java.math.BigDecimal.ZERO;
                                s.cost = s.cost.add(
                                                itemCost.multiply(java.math.BigDecimal.valueOf(item.getQuantity())));
                        }
                }

                statsMap.forEach((name, s) -> {
                        java.math.BigDecimal profit = s.revenue.subtract(s.cost);
                        java.math.BigDecimal margin = s.revenue.compareTo(java.math.BigDecimal.ZERO) > 0
                                        ? profit.divide(s.revenue, 4, java.math.RoundingMode.HALF_UP)
                                                        .multiply(java.math.BigDecimal.valueOf(100))
                                        : java.math.BigDecimal.ZERO;

                        productPerformance.add(com.scm.server.dto.FinancialMetricsDTO.ProductPerformanceDTO.builder()
                                        .productName(name)
                                        .revenue(s.revenue)
                                        .profit(profit)
                                        .marginPercentage(margin)
                                        .build());
                });

                productPerformance.sort((a, b) -> b.getRevenue().compareTo(a.getRevenue())); // Sort by Revenue

                return com.scm.server.dto.FinancialMetricsDTO.builder()
                                .totalRevenue(totalRevenue)
                                .cogs(totalCost)
                                .grossProfit(grossProfit)
                                .netMarginPercentage(netMargin)
                                .averageOrderValue(avgOrderValue)
                                .inventoryValuation(inventoryValuation)
                                .topProducts(productPerformance.stream().limit(5)
                                                .collect(java.util.stream.Collectors.toList()))
                                .build();
        }
}
