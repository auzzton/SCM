package com.scm.server.service;

import com.scm.server.config.KafkaTopicConfig;
import com.scm.server.event.OrderStateChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Publishes order-related events to Kafka topics.
 * Decoupled from OrderService so it can be unit-tested independently.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderEventProducer {

    private final KafkaTemplate<String, OrderStateChangedEvent> kafkaTemplate;

    /**
     * Publishes an OrderStateChangedEvent to the order events topic.
     * Uses orderId as the Kafka message key to ensure all events for the same
     * order land on the same partition (preserving event ordering per order).
     *
     * @param event The fully constructed event payload.
     */
    public void publishOrderStateChanged(OrderStateChangedEvent event) {
        String key = event.getOrderId().toString();

        CompletableFuture<SendResult<String, OrderStateChangedEvent>> future =
                kafkaTemplate.send(KafkaTopicConfig.ORDER_EVENTS_TOPIC, key, event);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("[Kafka] Failed to publish OrderStateChangedEvent for orderId={}: {}",
                        event.getOrderId(), ex.getMessage(), ex);
            } else {
                log.info("[Kafka] Published OrderStateChangedEvent for orderId={} to partition={} offset={}",
                        event.getOrderId(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }
}
