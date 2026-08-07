# ============================================================
# Stage 1: Build - Maven with JDK 17
# ============================================================
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml first to leverage Docker layer caching for dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the fat JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================================
# Stage 2: Run - Minimal JRE runtime image
# ============================================================
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

USER spring

EXPOSE 8080

# Use exec form to run the JAR — avoids shell signal handling issues
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
