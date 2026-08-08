# SCM Architectural Transition — Walkthrough

## Summary

The SCM project has been upgraded from a plain client-server monolith into a production-ready, containerized, observable application that mirrors the architecture of an enterprise distributed system. All code compiles against the existing Spring Boot 3 / Next.js 16 stack with no breaking changes to existing functionality.

---

## What Was Built

### 1. Containerization

| File | Purpose |
|---|---|
| [scm-client/Dockerfile](file:///c:/Projects/SCM/scm-client/Dockerfile) | 3-stage Next.js build using `output: "standalone"` — smallest possible image |
| [scm-server/Dockerfile](file:///c:/Projects/SCM/scm-server/Dockerfile) | 2-stage Maven build → minimal JRE 17 Alpine runtime with non-root user |
| [scm-client/.dockerignore](file:///c:/Projects/SCM/scm-client/.dockerignore) | Excludes `node_modules` and `.next` from build context |
| [scm-server/.dockerignore](file:///c:/Projects/SCM/scm-server/.dockerignore) | Excludes Maven `target/` from build context |

### 2. Local Development Stack (Docker Compose)

| Service | URL | Credentials |
|---|---|---|
| Spring Boot API | `http://localhost:8080/api` | — |
| Swagger UI | `http://localhost:8080/swagger-ui.html` | — |
| Next.js Frontend | `http://localhost:3000` | — |
| pgAdmin | `http://localhost:5050` | `admin@scm.local` / `admin` |
| Kafka UI | `http://localhost:8090` | — |
| Prometheus | `http://localhost:9090` | — |
| Grafana | `http://localhost:3001` | `admin` / `admin` |

> [!TIP]
> **To start everything locally:**
> ```bash
> # From the project root
> docker-compose up --build
> ```
> First run takes ~3–5 minutes to pull images and build JARs. Subsequent runs use cached layers.

### 3. Kafka Integration

| File | Role |
|---|---|
| [KafkaTopicConfig.java](file:///c:/Projects/SCM/scm-server/src/main/java/com/scm/server/config/KafkaTopicConfig.java) | Declares topics: `scm.order.state-changed`, DLQ, `scm.audit.log` |
| [OrderStateChangedEvent.java](file:///c:/Projects/SCM/scm-server/src/main/java/com/scm/server/event/OrderStateChangedEvent.java) | Self-contained event payload POJO for Kafka messages |
| [OrderEventProducer.java](file:///c:/Projects/SCM/scm-server/src/main/java/com/scm/server/service/OrderEventProducer.java) | Publishes events with orderId as partition key (guarantees ordering per order) |
| [OrderService.java](file:///c:/Projects/SCM/scm-server/src/main/java/com/scm/server/service/OrderService.java) | Calls producer after DB commit — Kafka failure never rolls back the transaction |
| [AuditLogConsumer.java](file:///c:/Projects/SCM/scm-server/src/main/java/com/scm/server/service/AuditLogConsumer.java) | Consumes events → writes `AuditLog` entries (eventual consistency) |

**Event Flow:**
```
Manager clicks "Complete Order"
  → OrderService.updateOrderStatus() [DB Transaction]
      → Order.status = COMPLETED saved to PostgreSQL ✓
      → publishOrderStateChangedEvent() called after commit
          → OrderEventProducer publishes to kafka:scm.order.state-changed
              → AuditLogConsumer receives event
                  → AuditLog row written to DB ✓
```

### 4. Configuration Overhaul

| Change | Why |
|---|---|
| `application.properties` → [application.yml](file:///c:/Projects/SCM/scm-server/src/main/resources/application.yml) | Structured, readable, supports multi-environment profiles |
| All secrets moved to `${ENV_VAR:default}` | Same binary works local → Docker → K8s without rebuilding |
| CORS origins environment-driven | No code change needed when deploying to a new domain |
| HikariCP pool configured | Prevents connection pool exhaustion under load |
| K8s liveness/readiness probes | Spring Boot Actuator `/health/liveness` and `/health/readiness` endpoints |

### 5. Monitoring

| File | Purpose |
|---|---|
| `pom.xml` additions | `spring-boot-starter-actuator` + `micrometer-registry-prometheus` |
| [application.yml](file:///c:/Projects/SCM/scm-server/src/main/resources/application.yml) | Exposes `/actuator/prometheus` endpoint |
| [prometheus.yml](file:///c:/Projects/SCM/monitoring/prometheus/prometheus.yml) | Scrapes the server's `/actuator/prometheus` every 10s |
| [Grafana provisioning](file:///c:/Projects/SCM/monitoring/grafana/provisioning/datasources/prometheus.yml) | Auto-connects Grafana to Prometheus on startup |

> [!TIP]
> Import these Grafana dashboard IDs after startup:
> - **JVM / Spring Boot:** ID `4701` (JVM Micrometer)
> - **Spring Boot 3.x:** ID `19004`

### 6. CI/CD Pipeline

| Job | Trigger | What it does |
|---|---|---|
| `test-backend` | Every push/PR | `mvn clean verify` with H2 in-memory DB |
| `test-frontend` | Every push/PR | TypeScript check + ESLint |
| `build-and-push` | Push to `main` only | Builds Docker images → pushes to ECR (OIDC auth, no stored keys) |
| `deploy` | Push to `main` only | Updates K8s deployment image tags → `kubectl apply` → waits for rollout |

**OIDC Setup (one-time AWS setup required):**
```bash
# 1. Create an IAM Identity Provider for GitHub OIDC in your AWS account
# 2. Create two IAM Roles with trust policy for your repo:
#    - github-actions-scm-ecr-push  (ECR push permissions)
#    - github-actions-scm-eks-deploy (EKS update permissions)
# 3. Store your AWS account ID in GitHub Secrets as: AWS_ACCOUNT_ID
```

### 7. Kubernetes Resources

```
k8s/
├── namespace.yaml             # scm namespace
├── configmap.yaml             # Non-sensitive shared config
├── secrets.yaml               # Template (DO NOT populate with real values)
├── ingress.yaml               # AWS ALB Ingress (TLS termination via ACM)
├── scm-server/
│   ├── deployment.yaml        # 2 replicas, rolling update, probes
│   ├── service.yaml           # ClusterIP on port 80→8080
│   └── hpa.yaml               # Auto-scales 2→8 pods at 70% CPU
└── scm-client/
    ├── deployment.yaml        # 2 replicas, Next.js standalone
    └── service.yaml           # ClusterIP on port 80→3000
```

---

## AWS Production Setup Checklist

> [!IMPORTANT]
> These steps require an active AWS account and AWS CLI configured.

```bash
# 1. Create ECR repositories (run once)
aws ecr create-repository --repository-name scm-server --region us-east-1
aws ecr create-repository --repository-name scm-client --region us-east-1

# 2. Create EKS cluster (via eksctl — takes ~15 mins)
eksctl create cluster \
  --name scm-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --managed

# 3. Install AWS Load Balancer Controller
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=scm-cluster

# 4. Create RDS Aurora Serverless PostgreSQL (via console or Terraform)
#    Note the endpoint, then update k8s/secrets.yaml accordingly.

# 5. Apply K8s manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml   # Fill real values first!
kubectl apply -f k8s/scm-server/
kubectl apply -f k8s/scm-client/
kubectl apply -f k8s/ingress.yaml
```

---

## What Was Intentionally Not Changed

- **Business logic** — `ProductService`, `AnalyticsService`, `DashboardService`, `SupplierService` are untouched.
- **Database schema** — No migration files changed. Hibernate `ddl-auto: update` handles the new `AuditLog` table.
- **Frontend UI** — Zero Next.js component changes. The client still hits the same API endpoints.
- **JWT / RBAC** — `SecurityConfig`, `JwtAuthenticationFilter`, `JwtService` unchanged (only CORS was made env-driven).
