# Quick Start Guide

Get the Job Application Tracker up and running in minutes! This guide covers the fastest way to set up your development environment and start contributing.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker & Docker Compose** (Recommended approach)
- **Git** for version control
- **Java 17+** (for backend development)
- **Node.js 20+** (for frontend development)
- **PostgreSQL 15+** (if not using Docker)

## 🚀 Option 1: Docker Compose (Recommended)

This is the fastest way to get everything running:

```bash
# 1. Clone the repository
git clone https://github.com/jnleyva816/Job-Application-Tracker.git
cd Job-Application-Tracker

# 2. Start all services
docker-compose up -d

# 3. Wait for services to be ready (about 30-60 seconds)
docker-compose logs -f

# 4. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:5432
```

### Verify Installation
```bash
# Check if all services are running
docker-compose ps

# Test backend API
curl http://localhost:8080/actuator/health

# Check frontend
curl http://localhost:3000
```

## 🛠️ Option 2: Manual Setup

If you prefer to run services individually:

### Step 1: Database Setup
```bash
# Option A: Use Docker for database only
docker run --name jobtracker-postgres \
  -e POSTGRES_DB=jobtracker \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Option B: Use local PostgreSQL
createdb jobtracker
```

### Step 2: Backend Setup
```bash
cd backend

# Create environment file
cp .env.example .env
# Edit .env with your database credentials

# Build and run
./mvnw clean install
./mvnw spring-boot:run
```

### Step 3: Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
```

## 🧪 Verify Your Setup

### 1. Backend Health Check
```bash
curl http://localhost:8080/actuator/health
```
Expected response:
```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "diskSpace": {"status": "UP"}
  }
}
```

### 2. Frontend Access
Open your browser and navigate to `http://localhost:3000`. You should see the Job Application Tracker landing page.

### 3. API Test
```bash
# Test user registration
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

## 🔑 Default Credentials

### Database
- Host: `localhost:5432`
- Database: `jobtracker`
- Username: `postgres`
- Password: `password`

### Application
- No default user accounts (you need to register)
- Admin functionality requires specific role assignment

## 📁 Project Structure Overview

```
Job-Application-Tracker/
├── backend/          # Spring Boot application
├── frontend/         # React application
├── docker-compose.yml # Docker services configuration
├── WIKI/            # Project documentation
└── CONTRIBUTING/    # Contributing guidelines
```

## 🚀 Next Steps

Now that you have the application running:

1. **Explore the Application**
   - Register a new user account
   - Create your first job application
   - Navigate through the interface

2. **Development Setup**
   - Read the [Development Environment Setup](Development-Environment-Setup.md)
   - Review the [Contributing Guidelines](../CONTRIBUTING/README.md)
   - Check out the [API Documentation](API-Documentation.md)

3. **Understanding the Architecture**
   - Review [Project Architecture](Project-Architecture.md)
   - Study the [Database Schema](Database-Schema.md)
   - Learn about the [Technology Stack](Technology-Stack.md)

## 🐛 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using port 8080 or 3000
sudo netstat -tulpn | grep :8080
sudo netstat -tulpn | grep :3000

# Stop conflicting services or change ports in docker-compose.yml
```

**Database connection issues:**
```bash
# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
```

**Build failures:**
```bash
# Clean and rebuild backend
cd backend && ./mvnw clean install

# Clear frontend cache
cd frontend && rm -rf node_modules package-lock.json
npm install
```

### Getting Help

- Check the [Troubleshooting Guide](Troubleshooting-Guide.md)
- Review [GitHub Issues](https://github.com/jnleyva816/Job-Application-Tracker/issues)
- Start a [Discussion](https://github.com/jnleyva816/Job-Application-Tracker/discussions)

## 🎯 What's Next?

Choose your path based on your role:

### For Developers
- [Backend Development Guide](Backend-Development.md)
- [Frontend Development Guide](Frontend-Development.md)
- [Testing Guide](Testing-Guide.md)

### For DevOps
- [CI/CD Pipeline](CI-CD-Pipeline.md)
- [Docker Guide](Docker-Guide.md)
- [Deployment Guide](Deployment-Guide.md)

### For Contributors
- [Contributing Guidelines](../CONTRIBUTING/README.md)
- [Code Review Process](Code-Review-Process.md)

---

*Need help? Check our [Support & Contact](Support-Contact.md) page or create an issue!* 