# Supply Chain Management (SCM) System - Detailed Project Profile

This document provides a comprehensive technical overview of the Supply Chain Management (SCM) project. It is structured to serve as an in-depth project walkthrough, technical rationale catalog, and interview preparation guide.

---

## 🚀 Resume Project Profile

### **Supply Chain Management (SCM) System**
*Full-Stack & Cloud Software Engineer | Java, Spring Boot, React, Next.js, AWS, Kubernetes, Terraform, PostgreSQL*

*   **Short Summary**: Built and deployed a secure, production-grade enterprise Supply Chain Management (SCM) system featuring real-time inventory tracking, automated purchase order fulfillment, supplier management, interactive financial reporting dashboards, and automated cloud infrastructure on AWS.
*   **Key Achievements & Metrics (Bullet Points)**:
    *   Designed and implemented a decoupled **Client-Server architecture** using **Spring Boot 3** and **Next.js 16 (React 19)**, ensuring high performance, responsiveness, and clear separation of concerns.
    *   Provisioned production AWS cloud infrastructure using **Terraform (IaC)**, configuring a multi-AZ **VPC** with private/public subnet segregation, **Amazon EKS** (Kubernetes 1.30) cluster, and private **Amazon RDS PostgreSQL** with KMS encryption.
    *   Containerized frontend and backend services using **Docker**, pushing multi-stage images to **Amazon ECR** with automated CVE security scanning (`scan_on_push`) and lifecycle retention rules.
    *   Orchestrated Kubernetes microservice deployments using **K8s manifests & Kustomize overlays**, configuring AWS ALB Ingress Controllers, NetworkPolicies, Pod Disruption Budgets (PDB), and **IRSA** (IAM Roles for Service Accounts) for least-privilege cloud access.
    *   Developed a stateless token-based authentication mechanism using **Spring Security** and **JSON Web Tokens (JWT)** with Role-Based Access Control (**RBAC**) for `ADMIN`, `MANAGER`, and `VIEWER` roles to secure critical API endpoints.
    *   Engineered a transactional inventory automation service using **Spring Data JPA (Hibernate)**; automatically updates product stock quantities upon order completion or cancellation, maintaining strict database consistency.
    *   Integrated serverless **PostgreSQL (Neon)** / **Amazon RDS PostgreSQL** with automated schema migrations, handling complex relational joins for order items, products, and suppliers.
    *   Built an interactive financial analytics dashboard using **Recharts**, delivering real-time visualizations of Cost of Goods Sold (COGS), gross margins, category distributions, and automated low-stock safety alerts.
    *   Managed global frontend state and session persistence using **Zustand**, reducing boilerplate state code and enforcing client-side route protection via a custom `AuthGuard` middleware wrapper.
    *   Configured **Axios** HTTP interceptors on the frontend to inject Bearer tokens into API requests dynamically, resolving security handshakes and managing token expiry states.
    *   Automated lightweight single-vm deployments on **AWS EC2** (Amazon Linux 2023, Docker Compose) with custom Security Group firewalls for cost-effective preview environments.

---

## 📂 Project Scope & Architecture

The system is designed to streamline **inbound logistics** and **warehouse inventory operations** for medium-scale businesses while adhering to cloud-native best practices.

```mermaid
graph TD
    subgraph Internet / Clients
        User[Browser Client]
    end

    subgraph AWS Cloud (Custom VPC)
        subgraph Public Subnets (Multi-AZ)
            ALB[AWS Application Load Balancer / NGINX Ingress]
        end

        subgraph Private Subnets (Multi-AZ)
            subgraph Amazon EKS Cluster
                Ingress[K8s Ingress Controller]
                ClientPods[Next.js Frontend Pods]
                ServerPods[Spring Boot Backend Pods]
            end

            subgraph Database Tier
                RDS[(Amazon RDS PostgreSQL / Neon DB)]
            end
        end

        ECR[Amazon ECR Image Registry]
        KMS[AWS KMS Encryption]
    end

    User <-->|HTTPS / JWT| ALB
    ALB --> ClientPods
    ClientPods <-->|REST API + JWT| ServerPods
    ServerPods <-->|Spring Data JPA / Port 5432| RDS
    EKS -.->|Image Pulls| ECR
    RDS -.->|Data at Rest Encryption| KMS
```

### **Business & System Scope**
1.  **Supplier Management**: A directory of authorized suppliers, complete with contacts and addresses.
2.  **Product & Inventory Ledger**: Complete list of products grouped by categories, tracking stock quantity, cost price, selling price, and a safety margin (**Minimum Stock Level**).
3.  **Automated Order Processing**: Managers can place orders with suppliers. The system automatically updates stock levels when orders transition to `COMPLETED` state.
4.  **Interactive Financial Auditing**: Calculates total inventory valuation, gross profit margin percentages, and product performance trends.
5.  **Role-Based Operations**: 
    *   **ADMIN**: Full control (user management, database adjustments).
    *   **MANAGER**: Inventory updates, supplier additions, order placing/approvals.
    *   **VIEWER**: Read-only access to dashboards, reports, and stock.
6.  **Cloud & Infrastructure Operations**:
    *   **Automated IaC**: Provisioned VPC, EKS, ECR, and RDS using modular Terraform code.
    *   **Container Orchestration**: Zero-downtime rolling updates, pod scaling, and network isolation via Kubernetes.

---

## 🛠️ Tech Stack & Rationale: Why These Technologies?

Choosing the right tool is a core engineering skill. Below is the rationale for every framework, database, and cloud technology used:

### **1. Backend: Spring Boot 3 & Java 17**
*   **Why Java 17?** It is a Long-Term Support (LTS) release, bringing features like Records, enhanced Switch pattern-matching, and virtual threads support, resulting in highly readable and performant code.
*   **Why Spring Boot 3?** Enterprise standard for building scalable microservices and RESTful APIs with native support for containerization, health metrics (`/actuator`), and dynamic configuration.

### **2. Database & ORM: Amazon RDS PostgreSQL / Neon & Hibernate (JPA)**
*   **Why PostgreSQL?** A robust relational database supporting complex ACID transactions, which are mandatory when dealing with inventory stock updates and financial order logs.
*   **Why Amazon RDS / Serverless Neon?** Amazon RDS provides high availability, automated 7-day backups, encryption at rest using AWS KMS, and network isolation inside private VPC subnets. Neon serverless DB offers instant branching for non-disruptive local/staging testing.
*   **Why Hibernate / Spring Data JPA?** Maps Java objects to database tables (ORM) and provides repository abstractions (`JpaRepository`) that prevent SQL injection vulnerabilities.

### **3. Infrastructure as Code (IaC): Terraform**
*   **Why Terraform?** Manages cloud resources declaratively. Replaces manual console clicks with version-controlled code, allowing the entire AWS stack (VPC, EKS, RDS, ECR) to be provisioned, updated, or destroyed consistently in minutes.

### **4. Containerization & Orchestration: Docker, Amazon ECR & Amazon EKS (Kubernetes)**
*   **Why Docker?** Packaging applications with runtime dependencies ensures 100% environment parity between developer machines and cloud servers.
*   **Why Amazon ECR?** Secure, private AWS container registry with automatic `scan_on_push` image vulnerability analysis and image lifecycle expiration rules.
*   **Why Amazon EKS (Kubernetes 1.30)?** Production-grade container orchestration providing automated self-healing (restarting failed containers), rolling zero-downtime deployments, and resource request/limit controls.

### **5. Security & Networking: AWS VPC, Spring Security, JWT & IRSA**
*   **Why Custom AWS VPC?** Segregates public-facing Load Balancers from private EKS nodes and RDS database instances, blocking direct internet access to critical database ports (5432).
*   **Why IRSA (IAM Roles for Service Accounts)?** Attaches fine-grained AWS IAM permissions directly to Kubernetes pods via OIDC rather than assigning broad IAM policies to underlying EC2 worker nodes.
*   **Why Stateless JWT Auth?** Session-based auth limits horizontal container scaling. JWTs allow Spring Boot backend containers in EKS to scale horizontally without session synchronization bottlenecks.

### **6. Frontend: Next.js 16 (React 19), Zustand & Tailwind CSS**
*   **Why Next.js & React 19?** Optimized render pipeline, file-based routing, and modern hook architectures.
*   **Why Zustand?** Ultra-lightweight state store with persistent local storage middleware for storing JWT tokens and auth state.

---

## ⚙️ Technical Deep-Dive: How the Core Workflows Run

### **1. Cloud Infrastructure Provisioning via Terraform**
The AWS environment is provisioned using modular HCL code in `terraform/`:
*   **VPC Module** ([resources.tf](file:///c:/Projects/SCM/terraform/resources.tf#L5-L28)): Provisions a multi-AZ VPC (`10.0.0.0/16`) with 3 public subnets and 3 private subnets, NAT Gateways for outbound egress, and subnet tags (`kubernetes.io/role/elb`) for AWS Load Balancer Controller auto-discovery.
*   **RDS Module** ([resources.tf](file:///c:/Projects/SCM/terraform/resources.tf#L107-L160)): Provisions Amazon RDS PostgreSQL 15.5 restricted strictly to private subnets with a Security Group that only permits ingress on port 5432 from EKS worker node CIDR blocks.
*   **EKS Module** ([resources.tf](file:///c:/Projects/SCM/terraform/resources.tf#L76-L100)): Deploys EKS Kubernetes v1.30 with managed node groups (`t3.medium`) and IAM Roles for Service Accounts (IRSA) enabled.

### **2. Containerization & Kubernetes Deployment Flow**
1. Docker builds multi-stage container images (`scm-server` and `scm-client`) to minimize production image sizes.
2. Images are tagged and pushed to **Amazon ECR**. ECR runs automated CVE security scans.
3. Kustomize overlays apply Kubernetes manifests (`/k8s`):
   * `Deployment`: Specifies container replicas, resource requests/limits, and liveness/readiness probes (`/actuator/health`).
   * `NetworkPolicy`: Restricts pod-to-pod network access.
   * `PodDisruptionBudget` (PDB): Guarantees minimum available replicas during Kubernetes node upgrades.
   * `Ingress`: Configures external routing via AWS ALB / NGINX Ingress Controller.

### **3. Secure JWT Request Flow**
1. User logs in via `/api/auth/login`.
2. Spring Boot authenticates credentials with `DaoAuthenticationProvider` and `BCryptPasswordEncoder`, returning a signed JWT token containing user role claims (`ADMIN`, `MANAGER`, `VIEWER`).
3. Next.js saves the token in Zustand state (`useAuthStore`).
4. **Axios Interceptors** ([api.ts](file:///c:/Projects/SCM/scm-client/src/lib/api.ts#L13-L25)) dynamically attach the JWT token to `Authorization: Bearer <token>` headers on all API requests.
5. On the backend, `JwtAuthenticationFilter` verifies the cryptographic signature and populates Spring's `SecurityContextHolder`.

### **4. Automated Stock Update Engine**
The system protects inventory balance integrity by executing stock updates under database transactions ([OrderService.java](file:///c:/Projects/SCM/scm-server/src/main/java/com/scm/server/service/OrderService.java#L82-L104)):
```java
@Transactional
public Order updateOrderStatus(UUID id, OrderStatus status) {
    Order order = getOrder(id);

    // If order was pending and is now COMPLETED, increase inventory stock
    if (order.getStatus() != OrderStatus.COMPLETED && status == OrderStatus.COMPLETED) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);
        }
    }
    order.setStatus(status);
    return orderRepository.save(order);
}
```
*   **Interview Point**: `@Transactional` ensures ACID compliance. If database connection or validation fails mid-loop, Hibernate issues a `ROLLBACK`, keeping physical inventory and order states synchronized.

---

## 💬 Technical Interview Q&A Preparation

#### **Q1: How is Cloud infrastructure incorporated into this project?**
> **Answer**: "We used AWS as our primary cloud provider and provisioned all infrastructure declaratively using Terraform (Infrastructure as Code). We configured a custom VPC across 3 Availability Zones with public and private subnets. The application runs on Amazon EKS (Kubernetes 1.30) inside private subnets, while the database runs on Amazon RDS PostgreSQL, isolated in private DB subnets with no public internet access. Container images are scanned and hosted in Amazon ECR, and web traffic is routed securely via an AWS Application Load Balancer."

#### **Q2: How did you secure the RDS database in the AWS Cloud?**
> **Answer**: "We implemented defense-in-depth security:
> 1. **Network Segregation**: The RDS instance is placed in private database subnets with `publicly_accessible = false`.
> 2. **Security Groups**: The DB security group strictly allows inbound traffic on port 5432 exclusively from the private subnet IP ranges where our EKS worker nodes run.
> 3. **Data Protection**: Storage is encrypted at rest using AWS KMS keys (`storage_encrypted = true`), and automated 7-day backups with deletion protection are configured."

#### **Q3: Why use Infrastructure as Code (Terraform) instead of provisioning resources manually in the AWS Console?**
> **Answer**: "Manual console provisioning is error-prone, hard to audit, and cannot be easily replicated across environments. By using Terraform, our entire architecture—VPC, subnets, EKS cluster, ECR registries, and RDS database—is defined in version-controlled HCL code (`.tf` files). This allows us to spin up identical dev, staging, or production environments predictably with a single command (`terraform apply`) and prevents configuration drift."

#### **Q4: How do pods running in Kubernetes (EKS) securely interact with AWS Cloud services?**
> **Answer**: "Instead of hardcoding static AWS IAM access keys inside container environment variables (which is a major security risk), we enabled IRSA (IAM Roles for Service Accounts) on our EKS cluster via Terraform. EKS uses an OIDC identity provider so that individual Kubernetes Pod service accounts can assume specific AWS IAM roles with least-privilege policies. The AWS SDK inside the pod automatically fetches short-lived temporary security tokens."

#### **Q5: How did you ensure database transactions remain reliable during order completion?**
> **Answer**: "I used Spring's `@Transactional` annotation at the service level on methods like `updateOrderStatus`. This tells Spring to wrap the execution in a single database transaction. If the inventory quantity update fails for any reason (like database connectivity loss or validation failure) midway through processing, the entire transaction is rolled back. This prevents situations where the order status transitions to 'Completed' but the physical stock levels do not get updated."

#### **Q6: Why did you use JWT instead of traditional stateful session cookies?**
> **Answer**: "Since we are using a decoupled client-server architecture deployed on Kubernetes, stateful session cookies would require sticky sessions or central session caching like Redis to allow horizontal scaling. By using JWT, the token is stored on the client side (in Zustand with local storage persistence). The Spring Boot backend pods remain completely stateless; any backend replica in the EKS cluster can authenticate requests by verifying the cryptographic signature of the JWT token."

