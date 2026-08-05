package com.scm.server.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Kafka event published when an order's status changes.
 * Consumed by any service that needs to react to order state transitions
 * (e.g. Inventory Service for stock updates, Analytics Service for audit logs).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStateChangedEvent {

    /** Unique event ID — used for idempotency checks on consumer side. */
    private UUID eventId;

    /** The order that changed state. */
    private UUID orderId;

    /** The supplier this order was placed with. */
    private UUID supplierId;

    /** Previous status before the transition. */
    private String previousStatus;

    /** New status after the transition. */
    private String newStatus;

    /** UTC timestamp of the state change. */
    private LocalDateTime changedAt;

    /** The items within this order. */
    private List<OrderItemPayload> items;

    /** ID of the user who triggered the state change. */
    private UUID triggeredByUserId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemPayload {
        private UUID productId;
        private Integer quantity;
        private BigDecimal unitPrice;
    }
}
