package com.scm.server.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardStats {
    private long totalProducts;
    private long totalSuppliers;
    private long totalOrders;
    private long lowStockCount;
    private BigDecimal totalStockValue;
    private long pendingOrders;
}
