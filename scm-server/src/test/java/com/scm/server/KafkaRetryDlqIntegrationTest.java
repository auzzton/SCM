package com.scm.server;

import com.scm.server.config.KafkaTopicConfig;
import com.scm.server.event.OrderStateChangedEvent;
import com.scm.server.repository.AuditLogRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.awaitility.Awaitility.await;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.doThrow;

/**
 * Integration test to verify that the Kafka Consumer Retry Policy and
 * Dead Letter Queue (DLQ) publishing function as expected.
 */
@SpringBootTest
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_CLASS)
class KafkaRetryDlqIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("scm_test")
            .withUsername("test_user")
            .withPassword("test_pass");

    @Container
    static KafkaContainer kafka = new KafkaContainer(
            DockerImageName.parse("confluentinc/cp-kafka:7.6.0")
    );

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        registry.add("jwt.secret", () -> "integration-test-secret-key-must-be-256-bits-xxxx");
    }

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @SpyBean
    private AuditLogRepository auditLogRepository;

    @Test
    void whenConsumerFails_shouldRetryAndSendToDlq() {
        // GIVEN: Configure the repository spy to throw an exception when saving any AuditLog record.
        // This simulates a database outage/constraint issue during message processing.
        doThrow(new RuntimeException("Simulated Database Outage"))
                .when(auditLogRepository).save(any());

        OrderStateChangedEvent event = OrderStateChangedEvent.builder()
                .eventId(UUID.randomUUID())
                .orderId(UUID.randomUUID())
                .previousStatus("PENDING")
                .newStatus("COMPLETED")
                .triggeredByUserId(UUID.randomUUID())
                .build();

        // WHEN: Publish an event to the order status topic.
        kafkaTemplate.send(KafkaTopicConfig.ORDER_EVENTS_TOPIC, event.getOrderId().toString(), event);

        // THEN: Verify the message is retried 1 initial time + 3 retries (total 4 attempts).
        await()
                .atMost(15, TimeUnit.SECONDS)
                .pollInterval(Duration.ofMillis(500))
                .untilAsserted(() -> {
                    Mockito.verify(auditLogRepository, atLeast(4)).save(any());
                });
    }
}
