# 🚀 CI/CD Quick Setup Guide

Your Job Application Tracker already has a comprehensive CI/CD pipeline configured! Here's what you need to get it running:

## ✅ What's Already Done

- ✅ Complete GitHub Actions workflow
- ✅ Multi-stage Docker builds for frontend and backend
- ✅ Automated testing (unit, integration, E2E)
- ✅ Security scanning (OWASP, Trivy)
- ✅ Code quality analysis (SonarCloud ready)
- ✅ Local development with Docker Compose

## 🔑 Required Credentials

### **Step 1: Docker Hub (REQUIRED)**
1. Create account at [hub.docker.com](https://hub.docker.com)
2. Go to Account Settings → Security → Access Tokens
3. Create token with "Read, Write, Delete" permissions
4. Add to GitHub Secrets:
   - `DOCKERHUB_USERNAME`: your username
   - `DOCKERHUB_TOKEN`: your access token

### **Step 2: GitHub Repository Setup**
1. Go to: https://github.com/jnleyva816/Job-Application-Tracker/settings/secrets/actions
2. Add the Docker Hub credentials above
3. Go to: https://github.com/jnleyva816/Job-Application-Tracker/settings/environments
4. Create environments: `staging` and `production`

## 🔧 Optional Enhancements

### **SonarCloud (Code Quality)**
- Sign up at [sonarcloud.io](https://sonarcloud.io) with GitHub
- Import your repository
- Add `SONAR_TOKEN` to GitHub secrets

### **Codecov (Test Coverage)**
- Sign up at [codecov.io](https://codecov.io) with GitHub
- Add repository and get `CODECOV_TOKEN`

### **Slack Notifications**
- Create Slack webhook
- Add `SLACK_WEBHOOK_URL` to GitHub secrets

## ☁️ Cloud Deployment (Optional)

### **AWS (Recommended)**
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
```

### **Google Cloud**
```bash
GCP_SA_KEY=your-service-account-json
GCP_PROJECT_ID=your-project-id
```

### **Azure**
```bash
AZURE_CREDENTIALS=your-service-principal-json
AZURE_SUBSCRIPTION_ID=your-subscription-id
```

## 🧪 Testing Your Pipeline

1. **Run the setup script** (interactive guide):
   ```bash
   ./setup-credentials.sh
   ```

2. **Test with a simple change**:
   ```bash
   git checkout -b develop
   echo "# Testing CI/CD" >> README.md
   git add .
   git commit -m "Test CI/CD pipeline"
   git push origin develop
   ```

3. **Monitor at**: https://github.com/jnleyva816/Job-Application-Tracker/actions

## 🏃‍♂️ Local Development

### **With Docker Compose (Recommended)**
```bash
docker-compose up -d
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Database: localhost:5432

### **Individual Services**
```bash
# Backend
cd backend && ./mvnw spring-boot:run

# Frontend  
cd frontend && npm install && npm run dev
```

## 📋 Pipeline Features

### **Continuous Integration**
- ✅ Automated testing (JUnit, Vitest, Playwright)
- ✅ Code quality checks (ESLint, Checkstyle, PMD)
- ✅ Security scanning (OWASP, Trivy)
- ✅ Test coverage reporting
- ✅ Build artifacts

### **Continuous Deployment**
- ✅ Docker image building and pushing
- ✅ Staging deployment (develop branch)
- ✅ Production deployment (main branch)
- ✅ Health checks and rollback capability
- ✅ Deployment notifications

## 🎯 Deployment Strategy

### **Branch Strategy**
- `develop` → Automatic staging deployment
- `main` → Production deployment (with approval)
- Feature branches → Run tests only

### **Environments**
- **Staging**: Test environment for integration testing
- **Production**: Live environment with approval gates

## 🚨 Troubleshooting

### **Common Issues**
1. **Missing Docker Hub credentials**: Pipeline fails at docker-build step
2. **Missing environments**: Deployment jobs are skipped
3. **Missing cloud credentials**: Deployment steps fail

### **Checking Pipeline Status**
1. Go to Actions tab in your repository
2. Check individual job logs for errors
3. Verify secrets are properly set

## 📞 Support

Your pipeline includes:
- Comprehensive error handling
- Detailed logging
- Health checks
- Automatic retries
- Rollback capabilities

**Ready to deploy!** 🎉

Just add your Docker Hub credentials and push to the `develop` branch to see your pipeline in action. 