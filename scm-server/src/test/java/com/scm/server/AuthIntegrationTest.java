package com.scm.server;

import com.scm.server.model.Role;
import com.scm.server.model.User;
import com.scm.server.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Full-stack integration test.
 *
 * Spins up a real PostgreSQL + Kafka container via Testcontainers,
 * starts the full Spring Boot application context, and exercises
 * the authentication flow end-to-end (no mocks involved).
 *
 * Prerequisites: Docker must be running on the host machine.
 * In CI, the GitHub Actions runner has Docker pre-installed.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
@org.springframework.test.annotation.DirtiesContext
class AuthIntegrationTest {

    // ── Shared containers — started ONCE for all tests ──────────
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("scm_test")
            .withUsername("test_user")
            .withPassword("test_pass");

    @Container
    static KafkaContainer kafka = new KafkaContainer(
            DockerImageName.parse("confluentinc/cp-kafka:7.6.0")
    );

    /**
     * Override Spring datasource and Kafka properties at test startup.
     * DynamicPropertySource injects container-assigned ports BEFORE
     * the Spring context initialises — no static port assumptions needed.
     */
    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        registry.add("jwt.secret", () -> "integration-test-secret-key-must-be-256-bits-xxxx");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    /**
     * Registration → Login happy path.
     * Verifies the full Spring Security + JWT chain using a real DB.
     */
    @Test
    void registerAndLogin_shouldReturnJwtToken() throws Exception {
        // GIVEN: register a new user
        String registerPayload = """
                {
                    "username": "integration_tester",
                    "password": "Password123!",
                    "email": "tester@scm.test",
                    "role": "MANAGER"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        // WHEN: login with the same credentials
        String loginPayload = """
                {
                    "username": "integration_tester",
                    "password": "Password123!"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void login_withWrongPassword_shouldReturn401() throws Exception {
        String loginPayload = """
                {
                    "username": "nonexistent_user",
                    "password": "wrong_password"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().isUnauthorized());
    }
}
