package com.scm.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String action; // e.g., "CREATE_ORDER", "UPDATE_STOCK"

    @Column(nullable = false)
    private String entityType; // e.g., "Order", "Product"

    @Column(nullable = false)
    private String entityId;

    @Column(nullable = false)
    private UUID userId; // ID of the user who performed the action

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
