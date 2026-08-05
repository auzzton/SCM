package com.scm.server.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;
import org.apache.kafka.common.TopicPartition;

/**
 * Configuration for Kafka consumer error handling, retry policies,
 * and Dead Letter Queue (DLQ) routing.
 */
@Slf4j
@Configuration
public class KafkaConsumerConfig {

    /**
     * Overrides the default listener container factory to set up common error handling
     * and retry mechanics for all Kafka consumers.
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<Object, Object> kafkaListenerContainerFactory(
            ConsumerFactory<Object, Object> consumerFactory,
            DefaultErrorHandler errorHandler
    ) {
        ConcurrentKafkaListenerContainerFactory<Object, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory);
        factory.setCommonErrorHandler(errorHandler);
        return factory;
    }

    /**
     * Configures the error handler. If a listener throws an exception:
     * 1. Retries the message up to 3 times with a 2-second delay between attempts.
     * 2. If all retries fail, publishes the message to the DLQ topic.
     */
    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> kafkaTemplate) {
        // Dead Letter Publishing Recoverer routes failed messages to the designated DLQ topic.
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(kafkaTemplate,
                (record, exception) -> {
                    log.error("[KafkaErrorHandler] Message failed all retry attempts. Routing to DLQ. " +
                                    "Topic: {}, Partition: {}, Offset: {}, Error: {}",
                            record.topic(), record.partition(), record.offset(), exception.getMessage());
                    
                    // Route order state changed events to the dedicated DLQ topic
                    if (KafkaTopicConfig.ORDER_EVENTS_TOPIC.equals(record.topic())) {
                        return new TopicPartition(KafkaTopicConfig.ORDER_EVENTS_DLQ_TOPIC, 0);
                    }
                    // Fallback for other topics
                    return new TopicPartition(record.topic() + ".dlq", 0);
                });

        // Retry 3 times with a 2-second fixed backoff delay
        FixedBackOff fixedBackOff = new FixedBackOff(2000L, 3L);

        DefaultErrorHandler errorHandler = new DefaultErrorHandler(recoverer, fixedBackOff);

        // Log warning messages for each retry attempt to aid troubleshooting
        errorHandler.setRetryListeners((record, ex, deliveryAttempt) -> {
            log.warn("[KafkaErrorHandler] Retry attempt {} for record on topic={}, partition={}, offset={}, due to: {}",
                    deliveryAttempt, record.topic(), record.partition(), record.offset(), ex.getMessage());
        });

        return errorHandler;
    }
}
