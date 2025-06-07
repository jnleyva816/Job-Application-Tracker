# Contributing to Job Application Tracker

Thank you for your interest in contributing to the Job Application Tracker! This document provides comprehensive guidelines for contributing to our project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Documentation](#documentation)
- [Community](#community)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE-OF-CONDUCT.md). Please read it to understand the expectations for all contributors.

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Git** installed and configured
- **Docker & Docker Compose** (recommended) or local development environment
- **Java 17+** for backend development
- **Node.js 20+** for frontend development
- **PostgreSQL 15+** (if not using Docker)

### First-Time Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Job-Application-Tracker.git
   cd Job-Application-Tracker
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/jnleyva816/Job-Application-Tracker.git
   ```

3. **Set up development environment**
   ```bash
   # Using Docker (recommended)
   docker-compose up -d
   
   # Or follow manual setup in WIKI/Quick-Start-Guide.md
   ```

4. **Verify setup**
   ```bash
   # Check if services are running
   curl http://localhost:8080/actuator/health
   curl http://localhost:3000
   ```

## 🛠️ Development Setup

### Environment Configuration

Create environment files for both frontend and backend:

**Backend (.env):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jobtracker
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-development-jwt-secret-key-here
SPRING_PROFILES_ACTIVE=dev
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Job Application Tracker
```

### Development Commands

**Backend:**
```bash
cd backend
./mvnw spring-boot:run          # Start development server
./mvnw test                     # Run tests
./mvnw test jacoco:report       # Generate coverage report
./mvnw checkstyle:check         # Check code style
```

**Frontend:**
```bash
cd frontend
npm run dev                     # Start development server
npm run test                    # Run unit tests
npm run test:e2e               # Run E2E tests
npm run lint                   # Check code style
npm run build                  # Build for production
```

## 🔄 Contribution Workflow

### 1. Choose an Issue

- Check [open issues](https://github.com/jnleyva816/Job-Application-Tracker/issues)
- Look for `good first issue` or `help wanted` labels
- Comment on the issue to indicate you're working on it

### 2. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/issue-number-short-description
# or
git checkout -b bugfix/issue-number-short-description
```

### 3. Make Your Changes

- Write clean, documented code
- Follow our coding standards
- Add/update tests as needed
- Update documentation if required

### 4. Test Your Changes

```bash
# Run backend tests
cd backend && ./mvnw test

# Run frontend tests
cd frontend && npm run test && npm run test:e2e

# Run all quality checks
./scripts/quality-check.sh  # If available
```

### 5. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add job application status filtering

- Add filter dropdown to application list
- Implement backend filtering endpoint
- Add unit tests for new functionality
- Update API documentation

Closes #123"
```

### 6. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/issue-number-short-description

# Create pull request on GitHub
```

## 📏 Code Standards

### General Guidelines

- **Write clear, readable code**
- **Follow established patterns** in the codebase
- **Add comments** for complex logic
- **Use meaningful variable and function names**
- **Keep functions small and focused**

### Backend (Java/Spring Boot)

- Follow **Google Java Style Guide**
- Use **Spring Boot conventions**
- Write **comprehensive Javadoc** for public methods
- Follow **SOLID principles**
- Use **proper exception handling**

**Example:**
```java
/**
 * Creates a new job application for the authenticated user.
 * 
 * @param request The job application request containing application details
 * @return ResponseEntity containing the created application
 * @throws BadRequestException if the request is invalid
 */
@PostMapping
public ResponseEntity<ApplicationResponse> createApplication(
    @Valid @RequestBody CreateApplicationRequest request) {
    // Implementation
}
```

### Frontend (React/TypeScript)

- Follow **Airbnb React/TypeScript Style Guide**
- Use **functional components** with hooks
- Implement **proper TypeScript typing**
- Follow **React best practices**
- Use **semantic HTML** and **accessibility** features

**Example:**
```tsx
interface JobApplicationProps {
  application: JobApplication;
  onUpdate: (application: JobApplication) => void;
  onDelete: (id: string) => void;
}

const JobApplicationCard: React.FC<JobApplicationProps> = ({
  application,
  onUpdate,
  onDelete,
}) => {
  // Implementation
};
```

### Database

- Use **meaningful table and column names**
- Follow **PostgreSQL naming conventions**
- Create **proper indexes** for performance
- Write **migration scripts** for schema changes

## 🧪 Testing Requirements

### Backend Testing

**Minimum Coverage:** 70%

**Test Types:**
- **Unit Tests:** Individual method/class testing
- **Integration Tests:** Service layer testing
- **Controller Tests:** REST endpoint testing
- **Security Tests:** Authentication/authorization testing

**Example:**
```java
@Test
void shouldCreateApplicationSuccessfully() {
    // Given
    CreateApplicationRequest request = new CreateApplicationRequest();
    request.setCompanyName("Test Company");
    request.setPosition("Software Engineer");
    
    // When
    ResponseEntity<ApplicationResponse> response = 
        controller.createApplication(request);
    
    // Then
    assertEquals(HttpStatus.CREATED, response.getStatusCode());
    assertNotNull(response.getBody());
}
```

### Frontend Testing

**Test Types:**
- **Unit Tests:** Component and utility testing
- **Integration Tests:** Component interaction testing
- **E2E Tests:** Complete user workflow testing

**Example:**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { JobApplicationCard } from './JobApplicationCard';

test('should display application details', () => {
  const mockApplication = {
    id: '1',
    companyName: 'Test Company',
    position: 'Software Engineer',
    status: 'APPLIED'
  };

  render(<JobApplicationCard application={mockApplication} />);
  
  expect(screen.getByText('Test Company')).toBeInTheDocument();
  expect(screen.getByText('Software Engineer')).toBeInTheDocument();
});
```

## 🔀 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with main

### PR Requirements

1. **Clear Title**: Descriptive and concise
2. **Detailed Description**: What, why, and how
3. **Issue Reference**: Link to related issues
4. **Testing**: Describe how you tested changes
5. **Screenshots**: For UI changes
6. **Breaking Changes**: Clearly documented

### PR Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for hard-to-understand code
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process

1. **Automated Checks**: CI/CD pipeline must pass
2. **Code Review**: At least one maintainer approval
3. **Testing**: All tests must pass
4. **Documentation**: Updates must be complete
5. **Merge**: Squash and merge to main

## 🐛 Issue Guidelines

### Reporting Bugs

Use the bug report template:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## 📚 Documentation

### When to Update Documentation

- **New features**: Always document new functionality
- **API changes**: Update API documentation
- **Configuration changes**: Update setup guides
- **Breaking changes**: Clearly document impacts

### Documentation Standards

- **Clear and concise** language
- **Step-by-step** instructions
- **Code examples** where appropriate
- **Screenshots** for UI changes
- **Up-to-date** information

## 👥 Community

### Getting Help

- **GitHub Discussions**: For questions and ideas
- **GitHub Issues**: For bugs and feature requests
- **Documentation**: Check WIKI for detailed guides

### Recognition

Contributors are recognized in:
- Project README
- Release notes
- Contributors page
- Special recognition for significant contributions

## 📋 Additional Resources

- [Project Architecture](../WIKI/Project-Architecture.md)
- [API Documentation](../WIKI/API-Documentation.md)
- [Testing Guide](../WIKI/Testing-Guide.md)
- [Docker Guide](../WIKI/Docker-Guide.md)
- [Troubleshooting Guide](../WIKI/Troubleshooting-Guide.md)

---

**Thank you for contributing to Job Application Tracker!** 🎉

Your contributions help make this project better for everyone. If you have any questions, don't hesitate to ask in our GitHub Discussions or create an issue.

*This document is maintained by the project maintainers and updated regularly.* 