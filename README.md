# Job Application Tracker

A full-stack application for tracking job applications, built with Spring Boot (backend) and React (frontend). Features a comprehensive CI/CD pipeline with automated testing, security scanning, and deployment.

## 🚀 CI/CD Pipeline

This project includes a production-ready CI/CD pipeline with:

- **Automated Testing**: Unit, integration, and E2E tests
- **Code Quality**: SonarQube, ESLint, and static analysis
- **Security Scanning**: OWASP dependency check and Trivy vulnerability scanning
- **Containerization**: Multi-stage Docker builds with security hardening
- **Multi-environment Deployment**: Staging and production environments
- **Monitoring**: Health checks and performance monitoring

📖 **[Complete CI/CD Setup Guide](CI-CD-SETUP.md)**

## Project Structure

```
Job_Application_Tracker/
├── .github/workflows/     # CI/CD pipeline configuration
├── backend/              # Spring Boot backend service
├── frontend/             # React frontend application
├── docker-compose.yml    # Local development setup
└── CI-CD-SETUP.md       # Comprehensive CI/CD documentation
```

## Backend

The backend is a Spring Boot application that provides a RESTful API for managing job applications and user accounts. Features include:

- **Spring Security**: JWT-based authentication
- **Spring Data JPA**: Database operations with PostgreSQL
- **Spring Boot Actuator**: Health checks and monitoring
- **Comprehensive Testing**: Unit and integration tests
- **Code Quality Tools**: JaCoCo, SpotBugs, PMD, Checkstyle

See [backend/README.md](backend/README.md) for detailed information.

## Frontend

The frontend is built using React with TypeScript and Vite, providing a modern, responsive user interface. Features include:

- **React 19**: Latest React with TypeScript
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Vitest**: Unit testing framework
- **Playwright**: End-to-end testing
- **ESLint**: Code quality and consistency

See [frontend/README.md](frontend/README.md) for detailed setup and development instructions.

## Quick Start

### With Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/Job_Application_Tracker.git
cd Job_Application_Tracker

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Database: localhost:5432
```

### Manual Setup

1. **Prerequisites**
   - Java 17+
   - Node.js 20+
   - PostgreSQL 15+
   - Docker (optional)

2. **Backend Setup**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Development Features

### Code Quality & Testing

- **Backend**: 70%+ test coverage requirement
- **Frontend**: Unit tests with Vitest, E2E tests with Playwright
- **Static Analysis**: Multiple tools for code quality assurance
- **Security**: Dependency scanning and vulnerability checks

### Development Tools

- **Hot Reload**: Both frontend and backend support hot reloading
- **Database Migrations**: Flyway for database version control
- **API Documentation**: OpenAPI/Swagger integration
- **Development Profiles**: Separate configurations for dev/test/prod

### Monitoring & Observability

- **Health Checks**: Comprehensive health monitoring
- **Metrics**: Application and business metrics collection
- **Logging**: Structured logging with different levels
- **Performance**: Response time and throughput monitoring

## CI/CD Features

### Automated Pipeline

- **Multi-stage builds**: Optimized Docker containers
- **Parallel execution**: Frontend and backend builds run concurrently
- **Quality gates**: Automated quality and security checks
- **Environment promotion**: Staging → Production workflow

### Security-First Approach

- **Vulnerability Scanning**: Container and dependency scanning
- **Security Headers**: Properly configured security headers
- **Non-root Containers**: All containers run as non-privileged users
- **Secrets Management**: Secure handling of sensitive data

### Deployment Strategy

- **Blue-Green Deployments**: Zero-downtime deployments
- **Rollback Capability**: Automated rollback on failure
- **Environment Parity**: Consistent environments across stages
- **Infrastructure as Code**: Declarative infrastructure management

## Development Status

- [x] Backend API implementation
- [x] Database schema and migrations
- [x] Authentication system with JWT
- [x] Frontend project setup with React 19
- [x] Comprehensive CI/CD pipeline
- [x] Docker containerization
- [x] Security scanning and quality gates
- [x] Multi-environment deployment setup
- [ ] Frontend feature implementation
- [ ] Production monitoring and alerting
- [ ] Performance optimization

## Contributing

We welcome contributions! Please see our [CI/CD Setup Guide](CI-CD-SETUP.md) for detailed information about:

- Code quality standards
- Testing requirements
- Security guidelines
- Deployment process

### Pull Request Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Ensure all tests pass and quality gates are met
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Special thanks to the open-source community and the following projects:

- **Spring Boot**: Excellent framework for Java applications
- **React**: Outstanding frontend library
- **GitHub Actions**: Powerful CI/CD platform
- **Docker**: Containerization platform
- **Playwright**: Reliable E2E testing
- **SonarQube**: Code quality platform
- **OWASP**: Security tools and best practices

---

## 📞 Support

For questions, issues, or contributions:

- 📖 Check the [CI/CD Setup Guide](CI-CD-SETUP.md)
- 🐛 Create an [Issue](https://github.com/yourusername/Job_Application_Tracker/issues)
- 💬 Start a [Discussion](https://github.com/yourusername/Job_Application_Tracker/discussions)

**Built with ❤️ for modern software development practices** # Testing updated Slack notifications Fri Jun  6 09:42:01 AM EDT 2025
