# Troubleshooting Guide

This guide helps you diagnose and resolve common issues when working with the Job Application Tracker project. Issues are organized by category with step-by-step solutions.

## 🔧 General Setup Issues

### Docker Compose Issues

**Problem**: `docker-compose up` fails with port conflicts
```bash
Error: Port 8080 is already in use
```

**Solution**:
```bash
# Check what's using the port
sudo netstat -tulpn | grep :8080
sudo lsof -i :8080

# Kill the process using the port
sudo kill -9 <PID>

# Or change ports in docker-compose.yml
# Change port mapping from "8080:8080" to "8081:8080"
```

**Problem**: `docker-compose up` fails with permission denied
```bash
Error: Permission denied while trying to connect to Docker daemon
```

**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Restart docker service
sudo systemctl restart docker

# Log out and log back in for changes to take effect
```

**Problem**: Services fail to start with "network not found"
```bash
Error: network jobtracker_default not found
```

**Solution**:
```bash
# Clean up docker networks
docker network prune

# Remove all containers and restart
docker-compose down --remove-orphans
docker-compose up -d
```

## 🗄️ Database Issues

### Connection Problems

**Problem**: Backend cannot connect to database
```bash
Error: Connection refused to database
```

**Solution**:
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs postgres

# Verify environment variables
cat backend/.env

# Test database connection
docker exec -it jobtracker_postgres_1 psql -U postgres -d jobtracker
```

**Problem**: Database authentication failed
```bash
Error: FATAL: password authentication failed for user "postgres"
```

**Solution**:
```bash
# Reset database container
docker-compose down -v
docker-compose up -d postgres

# Wait for database to initialize
sleep 30

# Check if database is ready
docker exec -it jobtracker_postgres_1 pg_isready -U postgres
```

### Migration Issues

**Problem**: Database schema not created
```bash
Error: Table 'users' doesn't exist
```

**Solution**:
```bash
# Check if backend is properly connected
curl http://localhost:8080/actuator/health

# Check backend logs for migration errors
docker-compose logs backend

# Manually run migrations if needed
cd backend
./mvnw flyway:migrate

# Or recreate database with proper schema
docker-compose down -v
docker-compose up -d
```

## ☕ Backend Issues

### Build Problems

**Problem**: Maven build fails with compilation errors
```bash
Error: [ERROR] COMPILATION ERROR
```

**Solution**:
```bash
# Clean and rebuild
cd backend
./mvnw clean compile

# Check Java version
java -version
# Should be Java 17 or higher

# Update Maven wrapper
./mvnw wrapper:wrapper

# Clear Maven cache
rm -rf ~/.m2/repository
./mvnw clean install
```

**Problem**: Tests fail with database connection
```bash
Error: Unable to obtain connection from database
```

**Solution**:
```bash
# Check if test profile is configured
cat backend/src/test/resources/application-test.yml

# Run tests with correct profile
./mvnw test -Dspring.profiles.active=test

# Or run tests with H2 database
./mvnw test -Dspring.datasource.url=jdbc:h2:mem:testdb
```

### Runtime Issues

**Problem**: Application fails to start with port binding error
```bash
Error: Port 8080 was already in use
```

**Solution**:
```bash
# Change server port in application.properties
echo "server.port=8081" >> backend/src/main/resources/application.properties

# Or set via environment variable
export SERVER_PORT=8081
./mvnw spring-boot:run
```

**Problem**: JWT authentication not working
```bash
Error: JWT token validation failed
```

**Solution**:
```bash
# Check JWT secret configuration
grep JWT_SECRET backend/.env

# Generate new JWT secret (minimum 256 bits)
openssl rand -base64 32

# Update .env file with new secret
echo "JWT_SECRET=your-new-secret-here" >> backend/.env

# Restart application
docker-compose restart backend
```

**Problem**: CORS errors when accessing from frontend
```bash
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
```bash
# Check CORS configuration in SecurityConfig.java
# Add frontend URL to allowed origins

# Or temporarily disable CORS for debugging
# Add @CrossOrigin annotation to controllers

# Restart backend after changes
docker-compose restart backend
```

## ⚛️ Frontend Issues

### Development Server Issues

**Problem**: `npm run dev` fails with module not found errors
```bash
Error: Cannot find module 'react'
```

**Solution**:
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
# Should be Node.js 20 or higher

# Clear npm cache
npm cache clean --force
```

**Problem**: Vite dev server fails to start
```bash
Error: Port 5173 is already in use
```

**Solution**:
```bash
# Use different port
npm run dev -- --port 3001

# Or kill process using the port
sudo lsof -i :5173
sudo kill -9 <PID>

# Configure custom port in vite.config.ts
# server: { port: 3001 }
```

### Build Issues

**Problem**: TypeScript compilation errors
```bash
Error: Type 'string | undefined' is not assignable to type 'string'
```

**Solution**:
```bash
# Run type checking
npm run type-check

# Fix type errors in code
# Use optional chaining and nullish coalescing
const value = data?.property ?? 'default';

# Update TypeScript configuration if needed
# Check tsconfig.json for strict settings
```

**Problem**: Build fails with out of memory error
```bash
Error: JavaScript heap out of memory
```

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or add to package.json scripts
"build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
```

### Runtime Issues

**Problem**: API requests fail with network errors
```bash
Error: NetworkError when attempting to fetch resource
```

**Solution**:
```bash
# Check if backend is running
curl http://localhost:8080/actuator/health

# Verify API URL configuration
cat frontend/.env
# Should have VITE_API_URL=http://localhost:8080

# Check browser network tab for detailed error
# Enable CORS if needed (see backend section)
```

**Problem**: Routes not working after page refresh
```bash
Error: Cannot GET /dashboard
```

**Solution**:
```bash
# Configure server to handle client-side routing
# For nginx, add try_files directive:
location / {
    try_files $uri $uri/ /index.html;
}

# For development server, this is handled by Vite automatically
# Check that React Router is properly configured
```

## 🧪 Testing Issues

### Unit Test Problems

**Problem**: Jest/Vitest tests fail with module resolution
```bash
Error: Cannot find module '@/components/Button'
```

**Solution**:
```bash
# Check vite.config.ts or vitest.config.ts for path aliases
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}

# Or update tsconfig.json paths
"paths": {
  "@/*": ["./src/*"]
}
```

**Problem**: Tests fail with DOM environment errors
```bash
Error: document is not defined
```

**Solution**:
```bash
# Configure test environment in vitest.config.ts
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts']
}

# Install required packages
npm install -D jsdom @testing-library/jest-dom
```

### E2E Test Issues

**Problem**: Playwright tests fail with browser launch errors
```bash
Error: Browser executable not found
```

**Solution**:
```bash
# Install Playwright browsers
npx playwright install

# Or install specific browser
npx playwright install chromium

# Check system dependencies
npx playwright install-deps
```

**Problem**: E2E tests fail with timeout errors
```bash
Error: Test timeout of 30000ms exceeded
```

**Solution**:
```bash
# Increase timeout in playwright.config.ts
timeout: 60000

# Or wait for specific elements
await page.waitForSelector('[data-testid="loading"]', { state: 'detached' });

# Use page.waitForLoadState()
await page.waitForLoadState('networkidle');
```

## 🐳 Docker Issues

### Container Build Problems

**Problem**: Docker build fails with permission denied
```bash
Error: permission denied while trying to connect to Docker daemon
```

**Solution**:
```bash
# Check Docker daemon status
sudo systemctl status docker

# Start Docker if not running
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

**Problem**: Docker build fails with space issues
```bash
Error: no space left on device
```

**Solution**:
```bash
# Clean up Docker system
docker system prune -a

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Check disk space
df -h
```

### Container Runtime Issues

**Problem**: Container exits immediately
```bash
Status: Exited (1) 2 minutes ago
```

**Solution**:
```bash
# Check container logs
docker logs jobtracker_backend_1

# Run container interactively for debugging
docker run -it jleyva816/jobtracker-backend:latest /bin/bash

# Check if all environment variables are set
docker exec -it jobtracker_backend_1 env
```

**Problem**: Container networking issues
```bash
Error: Connection refused between containers
```

**Solution**:
```bash
# Check if containers are on same network
docker network ls
docker network inspect jobtracker_default

# Use service names for internal communication
# Instead of localhost, use service name (e.g., "postgres", "backend")

# Test connectivity between containers
docker exec -it jobtracker_backend_1 ping postgres
```

## 🔐 Security & Authentication Issues

### JWT Token Issues

**Problem**: Token expired errors
```bash
Error: JWT token has expired
```

**Solution**:
```bash
# Check token expiration settings
grep JWT_EXPIRATION backend/.env

# Increase expiration time (in milliseconds)
# 24 hours = 86400000ms
echo "JWT_EXPIRATION=86400000" >> backend/.env

# Clear browser storage and login again
# localStorage.clear() in browser console
```

**Problem**: CORS policy errors
```bash
Error: blocked by CORS policy
```

**Solution**:
```bash
# Update CORS configuration in backend
# Allow frontend origin in SecurityConfig.java

@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})

# Or configure globally in application.yml
cors:
  allowed-origins: "*"
  allowed-methods: "*"
  allowed-headers: "*"
```

## 🚀 Deployment Issues

### Production Build Problems

**Problem**: Environment variables not loaded in production
```bash
Error: VITE_API_URL is undefined
```

**Solution**:
```bash
# Check if .env.production exists
ls -la frontend/.env*

# Build with correct environment
npm run build

# For Docker builds, pass env vars as build args
docker build --build-arg VITE_API_URL=https://api.yourdomain.com .
```

**Problem**: Static files not served correctly
```bash
Error: 404 for JS/CSS files
```

**Solution**:
```bash
# Check nginx configuration
# Ensure correct paths for static assets

location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Verify build output
ls -la frontend/dist/
```

## 📊 Performance Issues

### Slow Database Queries

**Problem**: API responses are slow
```bash
Response time > 5 seconds
```

**Solution**:
```bash
# Enable SQL logging in backend
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# Add database indexes for frequently queried columns
CREATE INDEX idx_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_applications_status ON job_applications(status);

# Check query execution plans
EXPLAIN ANALYZE SELECT * FROM job_applications WHERE user_id = ?;
```

### High Memory Usage

**Problem**: Application using too much memory
```bash
OutOfMemoryError in logs
```

**Solution**:
```bash
# Set JVM memory limits for backend
docker run -e JAVA_OPTS="-Xmx512m -Xms256m" jleyva816/jobtracker-backend:latest

# For frontend, optimize bundle size
npm run build:analyze

# Check for memory leaks in browser
# Use Chrome DevTools Memory tab
```

## 🔍 Debugging Tools

### Backend Debugging

```bash
# Enable debug logging
logging.level.com.jnleyva.jobtracker=DEBUG

# Connect remote debugger
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -jar app.jar

# Profile with JVisualVM
jvisualvm --jdkhome $JAVA_HOME
```

### Frontend Debugging

```bash
# Enable React DevTools
# Install browser extension

# Enable Vite debug mode
DEBUG=vite:* npm run dev

# Check bundle analyzer
npm run build -- --mode=analyze
```

## 📞 Getting Additional Help

If you can't resolve your issue:

1. **Search existing issues**: Check [GitHub Issues](https://github.com/jnleyva816/Job-Application-Tracker/issues)
2. **Check logs**: Always include relevant logs when asking for help
3. **Provide context**: Include your OS, versions, and steps to reproduce
4. **Create minimal reproduction**: Isolate the problem if possible

### Information to Include

When reporting issues, include:

```bash
# System information
uname -a
docker --version
node --version
java -version

# Project information
git rev-parse HEAD
cat docker-compose.yml
cat frontend/package.json | grep version
cat backend/pom.xml | grep version

# Logs
docker-compose logs backend
docker-compose logs frontend
```

---

*This troubleshooting guide is regularly updated with new solutions. If you solve an issue not covered here, please consider contributing the solution!* 