#!/bin/bash

# Docker Hub Credentials Verification Script
# This script helps verify that your Docker Hub setup is working correctly

set -e

echo "🐳 Docker Hub Credentials Verification"
echo "======================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed and running
print_step "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
fi

print_success "Docker is installed and running"

# Check GitHub repository
REPO_URL="https://github.com/jnleyva816/Job-Application-Tracker"
SECRETS_URL="${REPO_URL}/settings/secrets/actions"

print_step "Repository Information"
echo "Repository: ${REPO_URL}"
echo "Secrets URL: ${SECRETS_URL}"
echo ""

# Instructions for manual verification
print_step "Manual Verification Steps"
echo ""
echo "1. Go to your repository secrets page:"
echo "   ${SECRETS_URL}"
echo ""
echo "2. Verify you have these secrets configured:"
echo "   ✓ DOCKERHUB_USERNAME (your Docker Hub username)"
echo "   ✓ DOCKERHUB_TOKEN (Docker Hub access token)"
echo ""
echo "3. If missing, add them:"
echo "   • DOCKERHUB_USERNAME: your-dockerhub-username"
echo "   • DOCKERHUB_TOKEN: your-access-token-from-dockerhub"
echo ""

# Docker Hub token creation guide
print_step "Docker Hub Access Token Creation"
echo ""
echo "To create a Docker Hub access token:"
echo "1. Go to https://hub.docker.com"
echo "2. Log in to your account"
echo "3. Go to Account Settings → Security"
echo "4. Click 'New Access Token'"
echo "5. Name it 'GitHub Actions'"
echo "6. Select 'Read, Write, Delete' permissions"
echo "7. Copy the generated token"
echo "8. Add it as DOCKERHUB_TOKEN secret in GitHub"
echo ""

# Local Docker login test (optional)
print_step "Optional: Test Docker Hub Login Locally"
echo ""
echo "If you want to test your credentials locally:"
echo "1. Run: docker login"
echo "2. Enter your Docker Hub username"
echo "3. Enter your access token (not password) when prompted"
echo "4. If successful, run: docker logout"
echo ""

read -p "Do you want to test Docker Hub login now? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Testing Docker Hub login..."
    echo "Please enter your Docker Hub credentials:"
    
    if docker login; then
        print_success "Docker Hub login successful!"
        echo ""
        print_step "Testing Docker Hub access..."
        
        # Test with a minimal operation
        echo "Pulling hello-world image to verify access..."
        if docker pull hello-world:latest; then
            print_success "Docker Hub access verified!"
            docker image rm hello-world:latest &> /dev/null || true
        else
            print_warning "Could not pull test image, but login was successful"
        fi
        
        print_step "Logging out..."
        docker logout
        print_success "Logged out from Docker Hub"
    else
        print_error "Docker Hub login failed"
        echo "Please check your credentials and try again"
    fi
else
    print_step "Skipping local login test"
fi

echo ""
print_step "GitHub Actions Workflow Test"
echo ""
echo "After configuring the secrets, test your workflow:"
echo "1. Make a small change to your code"
echo "2. Commit and push to main or develop branch:"
echo "   git add ."
echo "   git commit -m 'Test Docker Hub authentication'"
echo "   git push origin main"
echo ""
echo "3. Check the Actions tab: ${REPO_URL}/actions"
echo "4. Look for the 'docker-build' job to verify it succeeds"
echo ""

print_step "Common Issues and Solutions"
echo ""
echo "❌ 'unauthorized: incorrect username or password'"
echo "   → Check DOCKERHUB_USERNAME and DOCKERHUB_TOKEN secrets"
echo "   → Make sure to use access token, not password"
echo ""
echo "❌ 'repository does not exist'"
echo "   → Repository name in workflow matches your Docker Hub namespace"
echo "   → Check the image names in docker/metadata-action"
echo ""
echo "❌ 'denied: requested access to the resource is denied'"
echo "   → Access token needs 'Write' permissions"
echo "   → Repository must exist on Docker Hub or be created automatically"
echo ""

print_success "Verification script completed!"
echo ""
echo "Next steps:"
echo "1. Configure the secrets in GitHub: ${SECRETS_URL}"
echo "2. Test the workflow by pushing a commit"
echo "3. Monitor the build: ${REPO_URL}/actions" 