package com.scm.server.service;

import com.scm.server.config.KafkaTopicConfig;
import com.scm.server.event.OrderStateChangedEvent;
import com.scm.server.model.AuditLog;
import com.scm.server.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Kafka consumer that reacts to order state change events.
 * Persists an immutable audit trail entry for every order transition.
 *
 * <p>This service demonstrates the Analytics/Audit bounded context consuming
 * events published by the Order bounded context — a core microservices pattern.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogConsumer {

    private final AuditLogRepository auditLogRepository;

    /**
     * Listens to the order state-changed topic and writes an AuditLog record.
     *
     * <p>Idempotency note: In production, store the eventId and check before writing
     * to handle Kafka re-deliveries without creating duplicate audit entries.</p>
     *
     * @param event   The deserialized Kafka event payload.
     * @param partition The Kafka partition this message came from (for logging).
     * @param offset    The Kafka offset (for tracing/debugging).
     */
    @KafkaListener(
            topics = KafkaTopicConfig.ORDER_EVENTS_TOPIC,
            groupId = "scm-audit-consumer-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleOrderStateChanged(
            @Payload OrderStateChangedEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset
    ) {
        log.info("[AuditConsumer] Received OrderStateChangedEvent: orderId={} {} -> {} | partition={} offset={}",
                event.getOrderId(),
                event.getPreviousStatus(),
                event.getNewStatus(),
                partition,
                offset);

        try {
            AuditLog auditLog = AuditLog.builder()
                    .action("ORDER_STATUS_CHANGED:" + event.getPreviousStatus() + "->" + event.getNewStatus())
                    .entityType("Order")
                    .entityId(event.getOrderId().toString())
                    .userId(event.getTriggeredByUserId())
                    .timestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("[AuditConsumer] AuditLog saved for orderId={}", event.getOrderId());

        } catch (Exception e) {
            log.error("[AuditConsumer] Failed to persist AuditLog for orderId={}: {}",
                    event.getOrderId(), e.getMessage(), e);
            // In production: send to DLQ via KafkaTemplate or configure error handler
            throw e; // re-throw so Kafka retries via DefaultErrorHandler
        }
    }
}
