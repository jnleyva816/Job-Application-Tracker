# Job Application Tracker

A comprehensive full-stack application for managing job applications, built with modern technologies and production-ready CI/CD practices. Features Spring Boot backend, React frontend, and a complete DevOps pipeline with automated testing, security scanning, and multi-stage deployments.

![Build Status](https://github.com/jnleyva816/Job-Application-Tracker/workflows/CI-CD/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-supported-blue.svg)

## 🚀 Quick Start

### With Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/jnleyva816/Job-Application-Tracker.git
cd Job-Application-Tracker

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:5432 (user: postgres, password: password)
```

### Manual Setup

**Prerequisites:**
- Java 17+
- Node.js 20+
- PostgreSQL 15+
- Docker (optional)

**Backend Setup:**
```bash
cd backend
cp .env.example .env  # Configure your environment variables
./mvnw spring-boot:run
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

## 📊 Project Structure

```
Job-Application-Tracker/
├── .github/workflows/     # CI/CD pipeline configuration
├── backend/              # Spring Boot backend service
│   ├── src/main/java/    # Java source code
│   ├── src/test/java/    # Test code
│   ├── Dockerfile        # Backend container configuration
│   └── pom.xml           # Maven dependencies
├── frontend/             # React frontend application
│   ├── src/              # TypeScript/React source code
│   ├── tests/            # Unit tests
│   ├── e2e-tests/        # End-to-end tests
│   ├── Dockerfile        # Frontend container configuration
│   └── package.json      # Node.js dependencies
├── deployment/           # Deployment configurations
├── ci-cd/               # CI/CD scripts and configurations
├── WIKI/                # Project documentation
├── CONTRIBUTING/        # Contribution guidelines
└── docker-compose.yml   # Local development setup
```

## 🏗️ Architecture

### Backend Architecture
- **Spring Boot 3.5.0** with Java 17
- **PostgreSQL** database with JPA/Hibernate
- **JWT Authentication** with Spring Security
- **RESTful API** design with OpenAPI documentation
- **Comprehensive Testing** (Unit, Integration, Security)
- **Code Quality Tools** (JaCoCo, SpotBugs, PMD, Checkstyle)

### Frontend Architecture
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive design
- **React Router** for navigation
- **Vitest** for unit testing
- **Playwright** for E2E testing

### DevOps & Infrastructure
- **Docker Containers** with multi-stage builds
- **GitHub Actions** CI/CD pipeline
- **Security Scanning** (OWASP, Trivy, SonarQube)
- **Automated Testing** across all layers
- **Blue-Green Deployments** with rollback capability

## 🔧 Features

### Application Features
- ✅ User authentication and authorization
- ✅ Job application tracking and management
- ✅ Company and contact management
- ✅ Interview scheduling and tracking
- ✅ Application status workflow
- ✅ Data visualization and analytics
- ✅ Responsive web interface

### Development Features
- ✅ Hot reload for development
- ✅ Comprehensive test coverage (70%+ requirement)
- ✅ Static code analysis and security scanning
- ✅ Database migrations with version control
- ✅ API documentation with Swagger/OpenAPI
- ✅ Development/staging/production environments

### CI/CD Features
- ✅ Automated builds and deployments
- ✅ Parallel execution of frontend/backend pipelines
- ✅ Quality gates and security checks
- ✅ Container security scanning
- ✅ Performance monitoring
- ✅ Slack notifications for build status

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Backend** | Spring Boot | 3.5.0 |
| **Frontend** | React | 19.0.0 |
| **Database** | PostgreSQL | 15+ |
| **Authentication** | JWT | - |
| **Containerization** | Docker | - |
| **CI/CD** | GitHub Actions | - |
| **Testing** | JUnit 5, Vitest, Playwright | - |
| **Code Quality** | SonarQube, ESLint | - |
| **Security** | OWASP, Trivy | - |

## 📖 Documentation

- **[WIKI](WIKI/)** - Comprehensive project documentation
- **[Contributing Guide](CONTRIBUTING/)** - How to contribute to the project
- **[Backend README](backend/README.md)** - Backend-specific documentation
- **[Frontend README](frontend/README.md)** - Frontend-specific documentation
- **[Quick Setup Guide](QUICK-SETUP.md)** - Rapid development setup

## 🔐 Security

This project implements security best practices:

- **Authentication**: JWT-based with secure token handling
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive request validation
- **Security Headers**: Proper HTTP security headers
- **Dependency Scanning**: Automated vulnerability detection
- **Container Security**: Non-root containers and security scanning
- **Data Protection**: Encrypted sensitive data storage

## 🧪 Testing Strategy

### Test Coverage Requirements
- **Backend**: Minimum 70% code coverage
- **Frontend**: Comprehensive unit and E2E testing
- **Integration**: End-to-end workflow testing
- **Security**: Automated security testing

### Test Types
- **Unit Tests**: Individual component testing
- **Integration Tests**: Service integration testing
- **E2E Tests**: Complete user workflow testing
- **Security Tests**: Authentication and authorization testing
- **Performance Tests**: Load and stress testing

## 🚀 Deployment

### Environments
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live application deployment

### Deployment Strategy
- **Blue-Green Deployments**: Zero-downtime deployments
- **Automated Rollbacks**: Failure detection and rollback
- **Health Checks**: Comprehensive monitoring
- **Scaling**: Horizontal scaling capabilities

## 📊 Monitoring & Observability

- **Application Metrics**: Performance and usage metrics
- **Health Endpoints**: Service health monitoring
- **Logging**: Structured logging with different levels
- **Error Tracking**: Comprehensive error monitoring
- **Performance Monitoring**: Response time and throughput tracking

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING/) for:

- Code of conduct
- Development setup
- Pull request process
- Code quality standards
- Testing requirements

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and quality checks
5. Submit a pull request

## 📋 Development Status

- [x] Backend API implementation
- [x] Database schema and migrations
- [x] JWT authentication system
- [x] Frontend project setup with React 19
- [x] Comprehensive CI/CD pipeline
- [x] Docker containerization
- [x] Security scanning and quality gates
- [x] Multi-environment deployment setup
- [x] E2E testing framework
- [ ] Frontend feature implementation (in progress)
- [ ] Production monitoring and alerting
- [ ] Performance optimization
- [ ] Mobile responsive enhancements

## 🐳 Docker Images

### Available Images
- **Backend**: `jleyva816/jobtracker-backend:latest`
- **Frontend**: `jleyva816/jobtracker-frontend:latest`

### Building Images
```bash
# Build backend image
docker build -t jleyva816/jobtracker-backend:latest ./backend

# Build frontend image
docker build -t jleyva816/jobtracker-frontend:latest ./frontend
```

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/jnleyva816/Job-Application-Tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/jnleyva816/Job-Application-Tracker/discussions)
- **Documentation**: [Project WIKI](WIKI/)
- **Contributing**: [Contributing Guide](CONTRIBUTING/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Special thanks to the open-source community and these amazing projects:

- **Spring Boot** - Excellent Java framework
- **React** - Outstanding frontend library
- **GitHub Actions** - Powerful CI/CD platform
- **Docker** - Containerization platform
- **Playwright** - Reliable E2E testing
- **SonarQube** - Code quality platform
- **OWASP** - Security tools and best practices
- **Tailwind CSS** - Utility-first CSS framework

---

**Built with ❤️ for modern software development practices**

*Last updated: January 2025*
