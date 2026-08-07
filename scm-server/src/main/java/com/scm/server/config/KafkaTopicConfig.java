package com.scm.server.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

/**
 * Kafka topic declarations.
 * Spring Kafka auto-creates these topics on startup if they don't exist
 * (requires KAFKA_AUTO_CREATE_TOPICS_ENABLE=true on the broker).
 */
@Configuration
public class KafkaTopicConfig {

    public static final String ORDER_EVENTS_TOPIC     = "scm.order.state-changed";
    public static final String ORDER_EVENTS_DLQ_TOPIC = "scm.order.state-changed.dlq";
    public static final String AUDIT_LOG_TOPIC        = "scm.audit.log";

    @Bean
    public NewTopic orderEventsTopic() {
        return TopicBuilder.name(ORDER_EVENTS_TOPIC)
                .partitions(3)      // 3 partitions allows 3 concurrent consumers
                .replicas(1)        // 1 replica for local dev (set to 3 in prod)
                .build();
    }

    @Bean
    public NewTopic orderEventsDlqTopic() {
        return TopicBuilder.name(ORDER_EVENTS_DLQ_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic auditLogTopic() {
        return TopicBuilder.name(AUDIT_LOG_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
