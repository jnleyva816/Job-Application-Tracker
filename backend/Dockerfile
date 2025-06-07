# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /workspace/app

# Copy maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY checkstyle.xml .

# Download dependencies for better layer caching
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S spring && adduser -u 1001 -S spring -G spring

# Set up working directory
WORKDIR /app

# Copy the Spring Boot fat JAR
COPY --from=build /workspace/app/target/*.jar app.jar

# Change ownership to spring user
RUN chown spring:spring app.jar
USER spring

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Expose port
EXPOSE 8080

# Run the application using the fat JAR
ENTRYPOINT ["java", "-jar", "/app/app.jar"] 