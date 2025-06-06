# CI/CD Troubleshooting Guide

## Recent Issues and Fixes

### Issue: Docker Authentication Failure

**Symptoms:**
```
Error: Error response from daemon: Get "https://registry-1.docker.io/v2/": unauthorized: incorrect username or password
```

**Root Causes:**
1. **Incorrect Secrets Configuration**: `DOCKERHUB_USERNAME` or `DOCKERHUB_TOKEN` not set properly
2. **Wrong Token Type**: Using Docker Hub password instead of access token
3. **Registry Confusion**: Trying to authenticate with ECR when credentials are for Docker Hub
4. **Mixed Authentication**: Using both ECR and Docker Hub parameters simultaneously

**Solutions:**

#### 1. Verify GitHub Secrets
Check that the following secrets are properly set in your repository:
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token (NOT your password)

#### 2. Generate Docker Hub Access Token
1. Go to Docker Hub → Account Settings → Security
2. Click "New Access Token"
3. Name it (e.g., "GitHub Actions")
4. Choose appropriate permissions (Read, Write, Delete)
5. Copy the generated token and add it to GitHub secrets as `DOCKERHUB_TOKEN`

#### 3. Separate Registry Authentication
- **For Docker Hub only**: Use `username` and `password` parameters
- **For AWS ECR**: Use `registry` parameter with AWS credentials
- **Never mix both** in the same login action

#### 4. Fixed Configuration Examples

**Docker Hub Only:**
```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
    logout: true
```

**AWS ECR Only:**
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION }}

- name: Log in to Amazon ECR
  uses: docker/login-action@v3
  with:
    registry: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com
```

**Both (Sequential):**
```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}

- name: Configure AWS credentials
  continue-on-error: true
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION }}

- name: Log in to Amazon ECR
  continue-on-error: true
  uses: docker/login-action@v3
  with:
    registry: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com
```

#### 5. Common Mistakes to Avoid
- ❌ **Don't use** `ecr: auto` with Docker Hub credentials
- ❌ **Don't use** Docker Hub password instead of access token
- ❌ **Don't mix** registry parameters in single login action
- ✅ **Do use** separate login actions for different registries
- ✅ **Do use** `continue-on-error: true` for optional registries
- ✅ **Do verify** secrets are properly set in repository settings

### Issue: E2E Tests Failing with Connection Errors

**Symptoms:**
```
curl: (7) Failed to connect to localhost port 8080 after 0 ms: Couldn't connect to server
Error: Process completed with exit code 124.
```

**Root Cause:**
1. Port 8080 was already in use in the CI environment
2. No dynamic port allocation
3. Insufficient service readiness checks
4. Poor error handling and logging

**Fixes Applied:**

#### 1. Dynamic Port Allocation
Added a `find_free_port()` function that:
- Scans for available ports starting from 8080/4173
- Sets `BACKEND_PORT` and `FRONTEND_PORT` environment variables
- Prevents port conflicts in CI runners

#### 2. Enhanced Service Management
- Added proper process killing for existing services
- Implemented PID tracking for both backend and frontend
- Added service startup logging for debugging

#### 3. Improved Health Checks
- Increased timeout from 60s to 120s for backend startup
- Added process monitoring (detects if services crash)
- Enhanced error reporting with log output on failure
- Added service verification step

#### 4. Better Configuration
- Dynamic API URL configuration for frontend builds
- Proper test profile activation with H2 database
- Added actuator endpoints for health monitoring

## Configuration Files Modified

### `.github/workflows/ci-cd.yml`
- Added dynamic port discovery
- Enhanced service startup with logging
- Improved health checks and error handling
- Added service log artifact collection

### `frontend/playwright.config.ts`
- Support for dynamic `PLAYWRIGHT_BASE_URL` environment variable
- Proper TypeScript configuration for Node.js types

### `frontend/tsconfig.node.json`
- Added Node.js types for environment variable access
- Included playwright.config.ts in compilation

### `backend/src/test/resources/application-test.properties`
- Added actuator endpoints for health checks
- Proper test database configuration

## Local Testing

Use the provided script to test E2E setup locally:

```bash
./test-e2e-local.sh
```

This script:
- Mimics the CI/CD environment setup
- Uses dynamic port allocation
- Provides detailed logging and status checks
- Automatically cleans up processes on exit

## Debugging Tips

### 1. Check Service Logs
CI/CD now uploads service logs as artifacts:
- `backend/backend.log` - Backend startup and runtime logs
- `frontend/frontend.log` - Frontend startup logs

### 2. Verify Port Availability
```bash
# Check if port is in use
netstat -tuln | grep :8080

# Kill processes on specific port
sudo lsof -ti:8080 | xargs sudo kill -9
```

### 3. Test Health Endpoints
```bash
# Backend health check
curl http://localhost:8080/actuator/health

# Frontend availability
curl http://localhost:4173
```

### 4. Environment Variables
Key environment variables for E2E tests:
- `PLAYWRIGHT_BASE_URL` - Frontend URL for tests
- `VITE_API_URL` - Backend API URL for frontend
- `BACKEND_PORT` - Dynamic backend port
- `FRONTEND_PORT` - Dynamic frontend port

## Common Issues

### Issue: "Port already in use"
**Solution:** The dynamic port allocation should prevent this, but if it occurs:
1. Check if processes from previous runs are still active
2. Verify the port scanning range (currently 100 ports)
3. Manually kill processes if needed

### Issue: "Health check timeout"
**Solution:**
1. Check backend startup logs for errors
2. Verify H2 database configuration
3. Ensure actuator endpoints are enabled
4. Check for Java/Maven issues

### Issue: "Frontend build fails"
**Solution:**
1. Verify `VITE_API_URL` environment variable
2. Check Node.js and npm versions
3. Ensure frontend dependencies are installed

### Issue: "Playwright tests timeout"
**Solution:**
1. Verify `PLAYWRIGHT_BASE_URL` is set correctly
2. Check if frontend is serving content
3. Review Playwright configuration
4. Ensure browser dependencies are installed

## Monitoring

The enhanced CI/CD pipeline now provides:

1. **Service Status Verification**
   - Health check responses
   - Service startup confirmation
   - Process monitoring

2. **Detailed Logging**
   - Service startup logs
   - Error diagnostics
   - Test execution details

3. **Artifact Collection**
   - Service logs
   - Test results
   - Screenshots/videos on failure

4. **Environment Information**
   - Port assignments
   - Configuration details
   - Service URLs

## Prevention

To prevent similar issues:

1. **Always use dynamic port allocation** in CI environments
2. **Implement proper health checks** with sufficient timeouts
3. **Add comprehensive logging** for debugging
4. **Test locally** using the provided script before pushing
5. **Monitor CI/CD metrics** and set up alerts for failures 