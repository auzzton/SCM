package com.scm.server.service;

import com.scm.server.dto.OrderRequest;
import com.scm.server.model.*;
import com.scm.server.repository.OrderRepository;
import com.scm.server.repository.ProductRepository;
import com.scm.server.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrder(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Transactional
    public Order createOrder(OrderRequest request) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

        Order order = Order.builder()
                .supplier(supplier)
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // Stock Management: For Purchase Orders (receiving stock from supplier), we
            // INCREASE stock?
            // OR is this a Sales Order (selling to customer)?
            // "Supply Chain Management" usually implies inbound (Suppliers) and outbound
            // (Customers/Internal).
            // Given "Supplier Management" feature, these are likely PURCHASE ORDERS
            // (Inbound).
            // So we should INCREASE stock when order is COMPLETED/RECEIVED.
            // For now, let's assume immediate stock update or update on status change.
            // Let's stick to: Order created -> Status Pending.
            // When Status -> COMPLETED -> Increase Stock.

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getPrice()) // Using current product price as cost
                    .build();

            order.getItems().add(orderItem);
            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
        }

        order.setTotalAmount(totalAmount);
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderStatus(UUID id, OrderStatus status) {
        Order order = getOrder(id);

        if (order.getStatus() != OrderStatus.COMPLETED && status == OrderStatus.COMPLETED) {
            // Order is being completed, INCREASE stock (Purchase Order logic)
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setQuantity(product.getQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        } else if (order.getStatus() == OrderStatus.COMPLETED && status != OrderStatus.COMPLETED) {
            // Reverting completion? Decrease stock back.
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setQuantity(product.getQuantity() - item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Transactional
    public void deleteOrder(UUID id) {
        orderRepository.deleteById(id);
    }
}
