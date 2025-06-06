# Docker Authentication Fix

## Problem
You were getting the following error in your GitHub Actions CI/CD pipeline:
```
Error: Error response from daemon: Get "https://registry-1.docker.io/v2/": unauthorized: incorrect username or password
```

Your error message showed conflicting configuration:
- `username: ***`
- `password: ***`
- `ecr: auto`  ← This was the problem
- `logout: true`

## Root Cause
The `ecr: auto` parameter in your Docker login action was trying to authenticate with AWS ECR (Elastic Container Registry) instead of Docker Hub, even though your credentials (`DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`) are for Docker Hub.

## Solution Applied

### 1. Fixed Docker Hub Authentication
**Before (problematic):**
```yaml
- name: Log in to Docker Hub
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
    ecr: auto  # ← This was causing the issue
    logout: true
```

**After (fixed):**
```yaml
- name: Log in to Docker Hub
  if: github.event_name != 'pull_request'
  uses: docker/login-action@v3
  with:
    username: ${{ secrets.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
    logout: true
```

### 2. Added Optional ECR Support
Added separate ECR authentication that will only run if AWS credentials are configured:

```yaml
- name: Configure AWS credentials for ECR
  if: github.event_name != 'pull_request'
  continue-on-error: true
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: ${{ secrets.AWS_REGION || 'us-east-1' }}

- name: Log in to Amazon ECR
  if: github.event_name != 'pull_request'
  continue-on-error: true
  uses: docker/login-action@v3
  with:
    registry: ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION || 'us-east-1' }}.amazonaws.com
```

## Key Fixes

1. **Removed `ecr: auto`** - This parameter was causing Docker Hub credentials to be used for ECR authentication
2. **Separated registries** - Docker Hub and ECR now have separate, independent login steps
3. **Added `continue-on-error: true`** - ECR login won't fail the pipeline if AWS credentials aren't configured
4. **Proper conditional logic** - ECR steps only run when appropriate

## Next Steps

1. **Verify GitHub Secrets** are set correctly:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username
   - `DOCKERHUB_TOKEN`: Docker Hub access token (NOT password)

2. **Generate Docker Hub Access Token** (if needed):
   - Go to [Docker Hub Security Settings](https://hub.docker.com/settings/security)
   - Click "New Access Token"
   - Choose appropriate permissions
   - Copy the token and add to GitHub secrets as `DOCKERHUB_TOKEN`

3. **Test the fix**:
   ```bash
   git add .
   git commit -m "Fix Docker authentication"
   git push origin develop  # or main
   ```

4. **Monitor the pipeline**: 
   Check [GitHub Actions](https://github.com/jnleyva816/Job-Application-Tracker/actions) for successful runs

## Common Mistakes to Avoid

❌ **Don't** use `ecr: auto` with Docker Hub credentials  
❌ **Don't** use Docker Hub password instead of access token  
❌ **Don't** mix registry parameters in single login action  
✅ **Do** use separate login actions for different registries  
✅ **Do** verify secrets are properly set in repository settings  

## Files Modified

- `.github/workflows/ci-cd.yml` - Fixed Docker login configuration
- `CI-CD-TROUBLESHOOTING.md` - Added comprehensive troubleshooting guide
- `diagnose-setup.sh` - Enhanced with Docker authentication checks 