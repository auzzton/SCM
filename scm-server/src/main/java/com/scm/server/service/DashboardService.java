package com.scm.server.service;

import com.scm.server.dto.DashboardStats;
import com.scm.server.model.OrderStatus;
import com.scm.server.repository.OrderRepository;
import com.scm.server.repository.ProductRepository;
import com.scm.server.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final OrderRepository orderRepository;

    public DashboardStats getStats() {
        var products = productRepository.findAll();
        var orders = orderRepository.findAll();

        long lowStockCount = products.stream()
                .filter(p -> p.getQuantity() <= p.getMinStockLevel())
                .count();

        BigDecimal totalStockValue = products.stream()
                .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING)
                .count();

        return DashboardStats.builder()
                .totalProducts(products.size())
                .totalSuppliers(supplierRepository.count())
                .totalOrders(orders.size())
                .lowStockCount(lowStockCount)
                .totalStockValue(totalStockValue)
                .pendingOrders(pendingOrders)
                .build();
    }
}
