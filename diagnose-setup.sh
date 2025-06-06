#!/bin/bash

# Job Application Tracker - Setup Diagnosis Script
# This script helps diagnose common setup issues

set -e

echo "🔍 Job Application Tracker - Setup Diagnosis"
echo "=============================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_ok() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if we're in the right directory
print_check "Checking project structure..."
if [ ! -f "docker-compose.yml" ] || [ ! -d ".github/workflows" ]; then
    print_error "Not in the correct directory. Please run from Job-Application-Tracker root."
    exit 1
fi
print_ok "Project structure looks good"

# Check git repository
print_check "Checking Git repository..."
if git remote -v | grep -q "jnleyva816/Job-Application-Tracker"; then
    print_ok "Git repository configured correctly"
    REPO_URL=$(git remote get-url origin)
    echo "   Repository: $REPO_URL"
else
    print_warning "Repository remote might not be set correctly"
fi

# Check current branch
print_check "Checking current branch..."
CURRENT_BRANCH=$(git branch --show-current)
echo "   Current branch: $CURRENT_BRANCH"

if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "develop" ]; then
    print_ok "You're on a deployment branch"
else
    print_warning "You're on branch '$CURRENT_BRANCH'. CI/CD only runs on 'main' and 'develop'"
fi

# Check GitHub CLI availability
print_check "Checking GitHub CLI..."
if command -v gh &> /dev/null; then
    print_ok "GitHub CLI is available"
    
    # Check if authenticated
    if gh auth status &> /dev/null; then
        print_ok "GitHub CLI is authenticated"
        
        # Check secrets (if possible)
        print_check "Checking repository secrets..."
        if gh secret list &> /dev/null; then
            SECRET_COUNT=$(gh secret list --json name | jq length 2>/dev/null || echo "0")
            echo "   Found $SECRET_COUNT secrets configured"
            
            # Check for required secrets
            if gh secret list | grep -q "DOCKERHUB_USERNAME"; then
                print_ok "DOCKERHUB_USERNAME is set"
            else
                print_error "DOCKERHUB_USERNAME secret is missing"
            fi
            
            if gh secret list | grep -q "DOCKERHUB_TOKEN"; then
                print_ok "DOCKERHUB_TOKEN is set"
            else
                print_error "DOCKERHUB_TOKEN secret is missing"
            fi
        else
            print_warning "Cannot check secrets (insufficient permissions)"
        fi
        
        # Check environments
        print_check "Checking repository environments..."
        if gh api "/repos/:owner/:repo/environments" 2>/dev/null | grep -q "staging"; then
            print_ok "Staging environment exists"
        else
            print_error "Staging environment not found"
        fi
        
        if gh api "/repos/:owner/:repo/environments" 2>/dev/null | grep -q "production"; then
            print_ok "Production environment exists"
        else
            print_error "Production environment not found"
        fi
        
    else
        print_warning "GitHub CLI not authenticated. Run: gh auth login"
    fi
else
    print_warning "GitHub CLI not installed. Cannot check secrets/environments automatically"
    echo "   Install with: sudo apt install gh  # or brew install gh"
fi

# Check workflow file syntax
print_check "Checking workflow file syntax..."
if command -v yq &> /dev/null || command -v python3 &> /dev/null; then
    if python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci-cd.yml'))" 2>/dev/null; then
        print_ok "Workflow YAML syntax is valid"
    else
        print_error "Workflow YAML has syntax errors"
    fi
else
    print_warning "Cannot validate YAML syntax (yq or python3 not available)"
fi

# Check Docker
print_check "Checking Docker setup..."
if command -v docker &> /dev/null; then
    print_ok "Docker is installed"
    if docker info &> /dev/null; then
        print_ok "Docker is running"
    else
        print_warning "Docker is not running. Start with: sudo systemctl start docker"
    fi
else
    print_warning "Docker not installed"
fi

# Check if recent workflow runs failed
print_check "Checking recent workflow runs..."
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    RECENT_RUNS=$(gh run list --limit 5 --json status,conclusion,headBranch 2>/dev/null)
    if [ -n "$RECENT_RUNS" ]; then
        echo "$RECENT_RUNS" | jq -r '.[] | "   \(.headBranch): \(.status) - \(.conclusion)"' 2>/dev/null || echo "   Unable to parse run data"
    else
        print_warning "No recent workflow runs found"
    fi
fi

echo ""
echo "🔧 Next Steps Based on Findings:"
echo "================================"

# Provide specific guidance
if ! command -v gh &> /dev/null; then
    echo "1. Install GitHub CLI: https://cli.github.com/"
    echo "2. Authenticate: gh auth login"
fi

echo "3. Ensure Docker Hub credentials are set:"
echo "   Go to: https://github.com/jnleyva816/Job-Application-Tracker/settings/secrets/actions"
echo "   Add: DOCKERHUB_USERNAME and DOCKERHUB_TOKEN"

echo "4. Create GitHub environments:"
echo "   Go to: https://github.com/jnleyva816/Job-Application-Tracker/settings/environments"
echo "   Create: 'staging' and 'production'"

echo "5. Test the pipeline:"
echo "   git checkout develop"
echo "   git add ."
echo "   git commit -m 'Test CI/CD pipeline'"
echo "   git push origin develop"

echo ""
echo "📊 Monitor your pipeline at:"
echo "https://github.com/jnleyva816/Job-Application-Tracker/actions"

echo ""
echo "🆘 If you're still getting errors, check the specific error message in GitHub Actions"
echo "   and share it for more targeted help."

# Run Docker authentication checks
check_github_secrets
check_docker_auth
check_workflow_config

echo ""
echo "🔍 Diagnosis Complete!"
echo "=====================" 
