#!/bin/bash

# Script to create GitHub environments for CI/CD deployment
# This addresses the missing environments issue

echo "🏗️ GitHub Environments Setup"
echo "============================="
echo ""

# Repository information
REPO_OWNER="jnleyva816"
REPO_NAME="Job-Application-Tracker"
REPO_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}"

echo "Repository: ${REPO_URL}"
echo ""

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Installing it will make setup easier."
    echo ""
    echo "Manual setup required:"
    echo "1. Go to: ${REPO_URL}/settings/environments"
    echo "2. Click 'New environment'"
    echo "3. Create environment named: staging"
    echo "4. Click 'New environment' again"
    echo "5. Create environment named: production"
    echo "6. For production environment:"
    echo "   - Enable 'Required reviewers'"
    echo "   - Add yourself as a reviewer"
    echo ""
    echo "Then run: git push origin develop"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI not authenticated."
    echo "Run: gh auth login"
    echo "Then run this script again."
    exit 1
fi

echo "✅ GitHub CLI is authenticated"

# Try to create environments using GitHub CLI
echo ""
echo "🔧 Creating GitHub environments..."

# Note: GitHub CLI doesn't have direct environment creation commands
# So we'll provide the manual steps and check if they exist

echo "Creating environments manually through GitHub API..."

# Check if environments already exist
echo "Checking existing environments..."

if gh api "repos/${REPO_OWNER}/${REPO_NAME}/environments" 2>/dev/null | grep -q '"name": "staging"'; then
    echo "✅ Staging environment already exists"
else
    echo "🔧 Creating staging environment..."
    # GitHub CLI doesn't support environment creation directly
    # We need to use the web interface or REST API
    echo "Please create staging environment manually:"
    echo "1. Go to: ${REPO_URL}/settings/environments"
    echo "2. Click 'New environment'"
    echo "3. Name: staging"
    echo "4. Click 'Configure environment'"
    echo "5. Click 'Save protection rules'"
fi

if gh api "repos/${REPO_OWNER}/${REPO_NAME}/environments" 2>/dev/null | grep -q '"name": "production"'; then
    echo "✅ Production environment already exists"
else
    echo "🔧 Creating production environment..."
    echo "Please create production environment manually:"
    echo "1. Go to: ${REPO_URL}/settings/environments"
    echo "2. Click 'New environment'"
    echo "3. Name: production"
    echo "4. Click 'Configure environment'"
    echo "5. Enable 'Required reviewers' and add yourself"
    echo "6. Click 'Save protection rules'"
fi

echo ""
echo "📋 Manual Environment Setup Guide:"
echo "=================================="
echo ""
echo "1. Open your browser and go to:"
echo "   ${REPO_URL}/settings/environments"
echo ""
echo "2. Create 'staging' environment:"
echo "   - Click 'New environment'"
echo "   - Name: staging"
echo "   - Click 'Configure environment'"
echo "   - No special settings needed"
echo "   - Click 'Save protection rules'"
echo ""
echo "3. Create 'production' environment:"
echo "   - Click 'New environment'"
echo "   - Name: production"
echo "   - Click 'Configure environment'"
echo "   - Enable 'Required reviewers'"
echo "   - Add your GitHub username as a reviewer"
echo "   - Click 'Save protection rules'"
echo ""
echo "4. Verify environments are created:"
echo "   - You should see both 'staging' and 'production' listed"
echo ""

# Check secrets as well
echo "🔐 Checking repository secrets..."

REQUIRED_SECRETS=("DOCKERHUB_USERNAME" "DOCKERHUB_TOKEN")
MISSING_SECRETS=()

for secret in "${REQUIRED_SECRETS[@]}"; do
    if gh secret list | grep -q "^${secret}"; then
        echo "✅ ${secret} is configured"
    else
        echo "❌ ${secret} is missing"
        MISSING_SECRETS+=("${secret}")
    fi
done

if [ ${#MISSING_SECRETS[@]} -gt 0 ]; then
    echo ""
    echo "🚨 Missing required secrets. Add them here:"
    echo "   ${REPO_URL}/settings/secrets/actions"
    echo ""
    for secret in "${MISSING_SECRETS[@]}"; do
        echo "   - ${secret}"
    done
fi

echo ""
echo "🧪 After setting up environments and secrets, test your pipeline:"
echo "================================================================="
echo ""
echo "# Switch to develop branch and make a test change"
echo "git checkout develop || git checkout -b develop"
echo "echo '# Testing CI/CD' >> README.md"
echo "git add ."
echo "git commit -m 'Test CI/CD pipeline'"
echo "git push origin develop"
echo ""
echo "# Monitor the pipeline"
echo "echo 'Monitor at: ${REPO_URL}/actions'"
echo ""

echo "✅ Environment setup guide completed!"
echo "Follow the manual steps above to complete the setup." 