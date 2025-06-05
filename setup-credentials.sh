

# Job Application Tracker - CI/CD Credentials Setup Guide
# This script will guide you through setting up all required credentials

set -e

echo "🚀 Job Application Tracker CI/CD Setup"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
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

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ] || [ ! -d ".github/workflows" ]; then
    print_error "Please run this script from the Job-Application-Tracker root directory"
    exit 1
fi

echo "This script will help you set up credentials for your CI/CD pipeline."
echo "You'll need to add these to your GitHub repository secrets."
echo ""

# Repository information
REPO_URL="https://github.com/jnleyva816/Job-Application-Tracker"
REPO_SECRETS_URL="${REPO_URL}/settings/secrets/actions"

print_step "Repository Setup"
echo "Your repository: ${REPO_URL}"
echo "Secrets page: ${REPO_SECRETS_URL}"
echo ""

# 1. Docker Hub Setup
print_step "1. Docker Hub Setup (REQUIRED)"
echo "Docker Hub is required for storing your container images."
echo ""
echo "1. Go to https://hub.docker.com and create an account (or log in)"
echo "2. Go to Account Settings → Security → Access Tokens"
echo "3. Create a new token with 'Read, Write, Delete' permissions"
echo "4. Copy the username and token"
echo ""
echo "Add these secrets to your GitHub repository:"
echo "- DOCKERHUB_USERNAME: your-dockerhub-username"
echo "- DOCKERHUB_TOKEN: your-access-token"
echo ""
read -p "Press Enter when you've added Docker Hub credentials..."

# 2. SonarCloud Setup
print_step "2. SonarCloud Setup (RECOMMENDED)"
echo "SonarCloud provides code quality analysis and security scanning."
echo ""
echo "1. Go to https://sonarcloud.io and sign in with GitHub"
echo "2. Click 'Import an organization' and connect your GitHub account"
echo "3. Import the 'Job-Application-Tracker' repository"
echo "4. Go to Administration → Security → Generate Tokens"
echo "5. Create a token with name 'GitHub Actions'"
echo ""
echo "Add this secret to your GitHub repository:"
echo "- SONAR_TOKEN: your-sonarcloud-token"
echo ""
read -p "Press Enter to continue (or skip if not using SonarCloud)..."

# 3. Code Coverage Setup
print_step "3. Codecov Setup (OPTIONAL)"
echo "Codecov provides test coverage reporting and tracking."
echo ""
echo "1. Go to https://codecov.io and sign in with GitHub"
echo "2. Add your repository"
echo "3. Copy the upload token from the setup page"
echo ""
echo "Add this secret to your GitHub repository:"
echo "- CODECOV_TOKEN: your-codecov-token"
echo ""
read -p "Press Enter to continue (or skip if not using Codecov)..."

# 4. Slack Notifications
print_step "4. Slack Notifications (OPTIONAL)"
echo "Get notified in Slack when deployments complete."
echo ""
echo "1. Create a Slack app in your workspace"
echo "2. Add 'Incoming Webhooks' feature"
echo "3. Create a webhook for your desired channel"
echo "4. Copy the webhook URL"
echo ""
echo "Add this secret to your GitHub repository:"
echo "- SLACK_WEBHOOK_URL: your-webhook-url"
echo ""
read -p "Press Enter to continue (or skip if not using Slack)..."

# 5. Cloud Provider Setup
print_step "5. Cloud Provider Setup (FOR DEPLOYMENT)"
echo "Choose a cloud provider for deployment:"
echo ""
echo "A) AWS (Recommended for beginners)"
echo "   - AWS_ACCESS_KEY_ID"
echo "   - AWS_SECRET_ACCESS_KEY" 
echo "   - AWS_REGION"
echo ""
echo "B) Google Cloud Platform"
echo "   - GCP_SA_KEY (service account JSON)"
echo "   - GCP_PROJECT_ID"
echo ""
echo "C) Azure"
echo "   - AZURE_CREDENTIALS (service principal JSON)"
echo "   - AZURE_SUBSCRIPTION_ID"
echo ""
echo "D) Skip for now (use local Docker only)"
echo ""
read -p "Choose option (A/B/C/D): " cloud_choice

case $cloud_choice in
    [Aa]* )
        echo ""
        echo "AWS Setup Instructions:"
        echo "1. Go to AWS IAM Console"
        echo "2. Create a new user with programmatic access"
        echo "3. Attach policies: AmazonECS_FullAccess, AmazonEC2ContainerRegistryFullAccess"
        echo "4. Save the Access Key ID and Secret Access Key"
        echo ""
        echo "Add these secrets to GitHub:"
        echo "- AWS_ACCESS_KEY_ID"
        echo "- AWS_SECRET_ACCESS_KEY"
        echo "- AWS_REGION (e.g., us-east-1)"
        ;;
    [Bb]* )
        echo ""
        echo "GCP Setup Instructions:"
        echo "1. Go to GCP Console → IAM & Admin → Service Accounts"
        echo "2. Create service account with Editor role"
        echo "3. Create and download JSON key"
        echo "4. Copy the entire JSON content"
        echo ""
        echo "Add these secrets to GitHub:"
        echo "- GCP_SA_KEY (entire JSON content)"
        echo "- GCP_PROJECT_ID"
        ;;
    [Cc]* )
        echo ""
        echo "Azure Setup Instructions:"
        echo "1. Install Azure CLI and run 'az login'"
        echo "2. Run: az ad sp create-for-rbac --name github-actions --role contributor --scopes /subscriptions/{subscription-id}"
        echo "3. Copy the JSON output"
        echo ""
        echo "Add these secrets to GitHub:"
        echo "- AZURE_CREDENTIALS (JSON output)"
        echo "- AZURE_SUBSCRIPTION_ID"
        ;;
    [Dd]* )
        echo ""
        print_warning "Skipping cloud setup. You can deploy locally with Docker Compose."
        ;;
    * )
        print_warning "Invalid choice. Skipping cloud setup."
        ;;
esac

echo ""
read -p "Press Enter when you've added cloud credentials (or skipped)..."

# 6. GitHub Environments Setup
print_step "6. GitHub Environments Setup"
echo "Setting up deployment environments:"
echo ""
echo "1. Go to ${REPO_URL}/settings/environments"
echo "2. Create environment named 'staging'"
echo "3. Create environment named 'production'"
echo "4. For production, enable 'Required reviewers' and add yourself"
echo ""
read -p "Press Enter when you've created the environments..."

# 7. Test the Pipeline
print_step "7. Testing Your CI/CD Pipeline"
echo ""
print_success "Setup Complete! Here's how to test your pipeline:"
echo ""
echo "1. Make a small change to your code"
echo "2. Commit and push to 'develop' branch:"
echo "   git checkout -b develop"
echo "   git add ."
echo "   git commit -m 'Test CI/CD pipeline'"
echo "   git push origin develop"
echo ""
echo "3. Check the Actions tab: ${REPO_URL}/actions"
echo "4. Create a pull request to 'main' for production deployment"
echo ""

# Summary
print_step "Summary of Required Secrets"
echo ""
echo "✅ REQUIRED:"
echo "   - DOCKERHUB_USERNAME"
echo "   - DOCKERHUB_TOKEN"
echo ""
echo "🔧 RECOMMENDED:"
echo "   - SONAR_TOKEN"
echo "   - CODECOV_TOKEN"
echo ""
echo "☁️  CLOUD (choose one):"
echo "   - AWS: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION"
echo "   - GCP: GCP_SA_KEY, GCP_PROJECT_ID"
echo "   - Azure: AZURE_CREDENTIALS, AZURE_SUBSCRIPTION_ID"
echo ""
echo "📢 OPTIONAL:"
echo "   - SLACK_WEBHOOK_URL"
echo ""

print_success "Your CI/CD pipeline is ready! 🚀"
echo ""
echo "Next steps:"
echo "1. Add the secrets to: ${REPO_SECRETS_URL}"
echo "2. Test with a push to develop branch"
echo "3. Monitor the pipeline at: ${REPO_URL}/actions"
echo ""

# Local development reminder
print_step "Local Development"
echo "To run locally with Docker Compose:"
echo "  docker-compose up -d"
echo ""
echo "To run individual services:"
echo "  Backend:  cd backend && ./mvnw spring-boot:run"
echo "  Frontend: cd frontend && npm install && npm run dev"
echo ""

print_success "Setup script completed!" 
