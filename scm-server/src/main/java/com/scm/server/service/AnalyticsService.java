package com.scm.server.service;

import com.scm.server.repository.OrderRepository;
import com.scm.server.repository.ProductRepository;
import com.scm.server.repository.SupplierRepository;
import com.scm.server.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalOrders", orderRepository.count());
        summary.put("totalProducts", productRepository.count());
        summary.put("totalSuppliers", supplierRepository.count());
        summary.put("totalUsers", userRepository.count());
        // Mock revenue for now as Order entity structure is unknown
        summary.put("totalRevenue", 150000.00);
        return summary;
    }
}
