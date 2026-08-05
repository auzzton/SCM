package com.scm.server.service;

import com.scm.server.config.KafkaTopicConfig;
import com.scm.server.event.OrderStateChangedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

/**
 * Consumer for the Dead Letter Queue (DLQ) topic.
 * Monitors and logs messages that failed all retry attempts.
 */
@Slf4j
@Service
public class OrderEventsDlqConsumer {

    /**
     * Listens to the Dead Letter Queue topic. 
     * In a production system, this component would trigger alerts,
     * notify engineers, or write to a dedicated database table for manual analysis.
     */
    @KafkaListener(
            topics = KafkaTopicConfig.ORDER_EVENTS_DLQ_TOPIC,
            groupId = "scm-dlq-consumer-group"
    )
    public void handleFailedOrderStateChanged(
            @Payload OrderStateChangedEvent event,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            @Header(name = KafkaHeaders.DLT_EXCEPTION_MESSAGE, required = false) String exceptionMessage
    ) {
        log.error("[DLQConsumer] CRITICAL: Message failed all retry attempts and was moved to DLQ! " +
                        "orderId={}, previousStatus={}, newStatus={}, partition={}, offset={}, reason={}",
                event.getOrderId(),
                event.getPreviousStatus(),
                event.getNewStatus(),
                partition,
                offset,
                exceptionMessage != null ? exceptionMessage : "Unknown exception");
    }
}
