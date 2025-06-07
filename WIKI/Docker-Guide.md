# Docker Guide

This guide covers all aspects of Docker usage in the Job Application Tracker project, from development to production deployment.

## 📦 Container Overview

The Job Application Tracker uses a multi-container architecture:

| Service | Image | Purpose | Port |
|---------|-------|---------|------|
| **Frontend** | `jleyva816/jobtracker-frontend:latest` | React application | 3000 |
| **Backend** | `jleyva816/jobtracker-backend:latest` | Spring Boot API | 8080 |
| **Database** | `postgres:15` | PostgreSQL database | 5432 |
| **Nginx** | `nginx:alpine` | Reverse proxy (production) | 80/443 |

## 🏗️ Multi-Stage Builds

Both frontend and backend use optimized multi-stage Docker builds for security and performance.

### Backend Dockerfile
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

### Frontend Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 Development with Docker Compose

### Local Development Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: jobtracker
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=jobtracker
      - DB_USER=postgres
      - DB_PASSWORD=password
      - JWT_SECRET=${JWT_SECRET:-your-secret-key}
    depends_on:
      - postgres
    volumes:
      - ./backend:/app
      - ~/.m2:/root/.m2

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://localhost:8080
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### Development Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build

# Clean up everything
docker-compose down -v --remove-orphans
```

## 🏭 Production Deployment

### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped

  backend:
    image: jleyva816/jobtracker-backend:latest
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - SPRING_PROFILES_ACTIVE=prod
    depends_on:
      - postgres
    networks:
      - app-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: jleyva816/jobtracker-frontend:latest
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

## 🔨 Building Images

### Manual Build Process
```bash
# Build backend image
cd backend
docker build -t jleyva816/jobtracker-backend:latest .

# Build frontend image
cd frontend
docker build -t jleyva816/jobtracker-frontend:latest .

# Tag for different versions
docker tag jleyva816/jobtracker-backend:latest jleyva816/jobtracker-backend:v1.0.0
docker tag jleyva816/jobtracker-frontend:latest jleyva816/jobtracker-frontend:v1.0.0
```

### Automated Build (CI/CD)
```yaml
# .github/workflows/ci-cd.yml (excerpt)
- name: Build and Push Backend Image
  run: |
    docker build -t jleyva816/jobtracker-backend:${{ github.sha }} ./backend
    docker tag jleyva816/jobtracker-backend:${{ github.sha }} jleyva816/jobtracker-backend:latest
    docker push jleyva816/jobtracker-backend:${{ github.sha }}
    docker push jleyva816/jobtracker-backend:latest

- name: Build and Push Frontend Image
  run: |
    docker build -t jleyva816/jobtracker-frontend:${{ github.sha }} ./frontend
    docker tag jleyva816/jobtracker-frontend:${{ github.sha }} jleyva816/jobtracker-frontend:latest
    docker push jleyva816/jobtracker-frontend:${{ github.sha }}
    docker push jleyva816/jobtracker-frontend:latest
```

## 🔐 Security Best Practices

### Container Security
- **Non-root users**: All containers run as non-privileged users
- **Distroless images**: Minimal attack surface with slim base images
- **Secret management**: Environment variables for sensitive data
- **Read-only filesystems**: Where possible
- **Network isolation**: Private networks for internal communication

### Image Scanning
```bash
# Scan images for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image jleyva816/jobtracker-backend:latest

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image jleyva816/jobtracker-frontend:latest
```

## 📊 Monitoring & Health Checks

### Health Check Configuration
```dockerfile
# Backend Dockerfile health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

### Container Monitoring
```bash
# Check container resource usage
docker stats

# View container logs
docker logs -f jobtracker_backend_1

# Inspect container configuration
docker inspect jobtracker_backend_1
```

## 🗂️ Volume Management

### Data Persistence
```yaml
volumes:
  postgres_data:
    driver: local
  backend_logs:
    driver: local
  nginx_logs:
    driver: local
```

### Backup Strategies
```bash
# Backup database volume
docker run --rm -v jobtracker_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Restore database volume
docker run --rm -v jobtracker_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup_20250101_120000.tar.gz -C /data
```

## ⚡ Performance Optimization

### Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Build Optimization
```dockerfile
# Use .dockerignore to exclude unnecessary files
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
coverage
.nyc_output
```

## 🚀 Deployment Commands

### Development Deployment
```bash
# Start development environment
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=2

# Update single service
docker-compose up -d --no-deps backend
```

### Production Deployment
```bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Rolling update
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
```

## 🐛 Troubleshooting

### Common Issues

**Build failures:**
```bash
# Clear build cache
docker builder prune

# Build without cache
docker build --no-cache -t jleyva816/jobtracker-backend:latest ./backend
```

**Container networking issues:**
```bash
# Inspect networks
docker network ls
docker network inspect jobtracker_default

# Test connectivity
docker exec -it jobtracker_backend_1 ping postgres
```

**Permission issues:**
```bash
# Check container user
docker exec -it jobtracker_backend_1 whoami

# Fix file permissions
sudo chown -R $USER:$USER ./data
```

### Debugging Commands
```bash
# Enter container shell
docker exec -it jobtracker_backend_1 /bin/bash

# View container processes
docker exec -it jobtracker_backend_1 ps aux

# Check container environment
docker exec -it jobtracker_backend_1 env
```

## 📋 Best Practices Checklist

- [ ] Use multi-stage builds for optimized images
- [ ] Run containers as non-root users
- [ ] Implement proper health checks
- [ ] Use specific image tags in production
- [ ] Configure resource limits
- [ ] Implement proper logging
- [ ] Use secrets management for sensitive data
- [ ] Regular security scanning of images
- [ ] Proper backup strategies for persistent data
- [ ] Container monitoring and alerting

---

*For more Docker-related questions, check the [Troubleshooting Guide](Troubleshooting-Guide.md) or create an issue.* 