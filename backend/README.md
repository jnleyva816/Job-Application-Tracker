# Job Application Tracker - Backend

A robust Spring Boot 3.5.0 backend service providing a RESTful API for managing job applications, user accounts, and related data. Built with modern Java practices, comprehensive security, and production-ready features.

![Java](https://img.shields.io/badge/Java-17+-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.0-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)
![Docker](https://img.shields.io/badge/Docker-supported-blue.svg)

## 🏗️ Architecture

The backend follows a layered architecture pattern with clear separation of concerns:

```
src/main/java/com/jnleyva/jobtracker_backend/
├── config/         # Configuration classes (Security, JPA, etc.)
├── controller/     # REST endpoints and request handling
├── model/          # JPA entities and data models
├── repository/     # Data access layer (Spring Data JPA)
├── service/        # Business logic and service layer
├── security/       # JWT and authentication components
├── exception/      # Custom exceptions and global error handling
├── filter/         # Request/response filters (JWT)
└── dto/           # Data Transfer Objects
```

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Build and run with Docker
docker build -t jleyva816/jobtracker-backend:latest .
docker run -p 8080:8080 \
  -e DB_HOST=your-db-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  jleyva816/jobtracker-backend:latest
```

### Local Development

**Prerequisites:**
- Java 17+
- Maven 3.6+
- PostgreSQL 15+

**Setup:**
```bash
# Clone and navigate to backend
git clone https://github.com/jnleyva816/Job-Application-Tracker.git
cd Job-Application-Tracker/backend

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Build and run
./mvnw clean install
./mvnw spring-boot:run
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobtracker
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-minimum-256-bits
JWT_EXPIRATION=86400000

# Application Configuration
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_JNLEYVA_JOBTRACKER=DEBUG
```

### Database Setup

**Option 1: Docker PostgreSQL**
```bash
docker run --name jobtracker-postgres \
  -e POSTGRES_DB=jobtracker \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

**Option 2: Local PostgreSQL**
```sql
CREATE DATABASE jobtracker;
CREATE USER jobtracker_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jobtracker TO jobtracker_user;
```

## 🔐 Authentication & Security

### JWT Authentication Flow

1. **User Registration/Login** → Receives JWT token
2. **Token Validation** → Each request validates JWT
3. **Role-Based Access** → RBAC with USER/ADMIN roles
4. **Secure Endpoints** → Protected API endpoints

### Security Features

- **Password Encryption**: BCrypt hashing
- **JWT Token Security**: HS512 algorithm with configurable expiration
- **CORS Configuration**: Configurable cross-origin requests
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries via JPA
- **XSS Protection**: Input sanitization and output encoding

### Authentication Endpoints

```bash
# User Registration
POST /api/users/register
Content-Type: application/json
{
  "username": "john_doe",
  "email": "john@example.com", 
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}

# User Login
POST /api/users/login
Content-Type: application/json
{
  "username": "john_doe",
  "password": "SecurePassword123!"
}

# Response
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "username": "john_doe",
  "email": "john@example.com",
  "roles": ["ROLE_USER"]
}
```

## 📋 API Endpoints

### User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/register` | Register new user | No |
| POST | `/api/users/login` | User login | No |
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/{id}` | Get user by ID | User/Admin |
| GET | `/api/users/username/{username}` | Get user by username | User/Admin |
| PUT | `/api/users/{id}` | Update user | User/Admin |
| DELETE | `/api/users/{id}` | Delete user | Admin |

### User Profile

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile` | Get current user profile | User |
| PUT | `/api/profile` | Update current user profile | User |
| PUT | `/api/profile/change-password` | Change password | User |

### Job Applications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/applications` | Get user's applications | User |
| GET | `/api/applications/{id}` | Get application by ID | User |
| POST | `/api/applications` | Create new application | User |
| PUT | `/api/applications/{id}` | Update application | User |
| DELETE | `/api/applications/{id}` | Delete application | User |

### Contacts (per Application)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/applications/{appId}/contacts` | Get application contacts | User |
| POST | `/api/applications/{appId}/contacts` | Add contact | User |
| PUT | `/api/applications/{appId}/contacts/{contactId}` | Update contact | User |
| DELETE | `/api/applications/{appId}/contacts/{contactId}` | Delete contact | User |

### Interviews (per Application)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/applications/{appId}/interviews` | Get application interviews | User |
| POST | `/api/applications/{appId}/interviews` | Schedule interview | User |
| PUT | `/api/applications/{appId}/interviews/{interviewId}` | Update interview | User |
| DELETE | `/api/applications/{appId}/interviews/{interviewId}` | Delete interview | User |

### Health & Monitoring

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/actuator/health` | Application health check | No |
| GET | `/actuator/info` | Application information | No |
| GET | `/actuator/metrics` | Application metrics | Admin |

## 🗄️ Database Schema

### Core Entities

**Users Table:**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Job Applications Table:**
```sql
CREATE TABLE job_applications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    company_name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'APPLIED',
    application_date DATE,
    salary_range VARCHAR(50),
    location VARCHAR(100),
    job_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Test Structure

```
src/test/java/com/jnleyva/jobtracker_backend/
├── controller/     # REST endpoint tests
├── service/        # Business logic tests  
├── repository/     # Data access tests
├── security/       # Authentication/authorization tests
├── config/         # Configuration tests
└── integration/    # Integration tests
```

### Running Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=UserControllerTest

# Run tests with coverage
./mvnw test jacoco:report

# View coverage report
open target/site/jacoco/index.html
```

### Test Configuration

Tests use **H2 in-memory database** for isolation and speed:

```yaml
# application-test.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
  jpa:
    hibernate:
      ddl-auto: create-drop
```

### Coverage Requirements

- **Minimum Coverage**: 70%
- **Controller Tests**: All endpoints
- **Service Tests**: All business logic
- **Integration Tests**: Complete workflows
- **Security Tests**: Authentication scenarios

## 🔧 Development

### Code Quality Tools

**Integrated Tools:**
- **JaCoCo**: Code coverage analysis
- **SpotBugs**: Static analysis for bugs
- **PMD**: Code quality analysis  
- **Checkstyle**: Code style enforcement
- **OWASP Dependency Check**: Security vulnerability scanning

**Running Quality Checks:**
```bash
# Code coverage
./mvnw jacoco:report

# Static analysis
./mvnw spotbugs:check
./mvnw pmd:check

# Code style
./mvnw checkstyle:check

# Security scan
./mvnw org.owasp:dependency-check-maven:check
```

### Development Profiles

**Available Profiles:**
- `dev`: Development configuration
- `test`: Testing configuration  
- `prod`: Production configuration

**Switching Profiles:**
```bash
# Development
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Production
java -jar -Dspring.profiles.active=prod target/jobtracker-backend.jar
```

### Hot Reload

Enable automatic restart during development:

```bash
# Add to application-dev.yml
spring:
  devtools:
    restart:
      enabled: true
```

## 🐳 Docker

### Multi-Stage Build

The Dockerfile uses multi-stage builds for optimization:

```dockerfile
# Build stage
FROM openjdk:17-jdk-slim as build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Runtime stage  
FROM openjdk:17-jre-slim
RUN addgroup --system spring && adduser --system spring --ingroup spring
USER spring:spring
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Building & Running

```bash
# Build image
docker build -t jleyva816/jobtracker-backend:latest .

# Run container
docker run -p 8080:8080 \
  -e DB_HOST=host.docker.internal \
  -e DB_USER=postgres \
  -e DB_PASSWORD=password \
  jleyva816/jobtracker-backend:latest

# Run with compose
docker-compose up -d
```

## 📊 Key Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Spring Boot** | 3.5.0 | Application framework |
| **Spring Security** | 6.x | Authentication & authorization |
| **Spring Data JPA** | 3.x | Data persistence |
| **PostgreSQL** | 42.x | Database driver |
| **JJWT** | 0.12.6 | JWT token handling |
| **Lombok** | 1.18.x | Boilerplate reduction |
| **H2** | 2.x | Testing database |
| **JUnit 5** | 5.x | Testing framework |

## 🚀 Deployment

### Production Deployment

```bash
# Build production image
docker build -t jleyva816/jobtracker-backend:v1.0.0 .

# Push to registry
docker push jleyva816/jobtracker-backend:v1.0.0

# Deploy with environment variables
docker run -d \
  --name jobtracker-backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=prod-db-host \
  -e DB_USER=prod-user \
  -e DB_PASSWORD=prod-password \
  -e JWT_SECRET=prod-jwt-secret \
  jleyva816/jobtracker-backend:v1.0.0
```

### Health Monitoring

```bash
# Check application health
curl http://localhost:8080/actuator/health

# Monitor application metrics
curl http://localhost:8080/actuator/metrics

# View application info
curl http://localhost:8080/actuator/info
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection:**
```bash
# Check database connectivity
docker exec -it jobtracker-backend ping postgres

# View logs
docker logs jobtracker-backend
```

**JWT Token Issues:**
```bash
# Verify JWT secret length (minimum 256 bits)
echo "your-jwt-secret" | wc -c

# Check token expiration
# Default: 24 hours (86400000 ms)
```

**Memory Issues:**
```bash
# Increase JVM memory
docker run -e JAVA_OPTS="-Xmx512m" jleyva816/jobtracker-backend:latest
```

## 📚 Additional Resources

- [API Documentation](../WIKI/API-Documentation.md)
- [Database Schema](../WIKI/Database-Schema.md)
- [Security Guide](../WIKI/Security-Guide.md)
- [Testing Guide](../WIKI/Testing-Guide.md)
- [Docker Guide](../WIKI/Docker-Guide.md)
- [Contributing Guidelines](../CONTRIBUTING/README.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ using Spring Boot and modern Java practices**

*For issues and feature requests, please visit our [GitHub Issues](https://github.com/jnleyva816/Job-Application-Tracker/issues)*
