#!/bin/bash

# Slack Notifications Setup Guide for Job Application Tracker CI/CD
# This script guides you through setting up Slack notifications

set -e

echo "📢 Slack Notifications Setup for CI/CD Pipeline"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Repository information
REPO_URL="https://github.com/jnleyva816/Job-Application-Tracker"
SECRETS_URL="${REPO_URL}/settings/secrets/actions"

echo "This script will help you set up Slack notifications for your CI/CD pipeline."
echo "Your pipeline will notify your Slack channel about build status, deployments, and failures."
echo ""

print_step "1. Choose Your Slack Setup Method"
echo ""
echo "Choose how you want to set up Slack notifications:"
echo ""
echo "A) Incoming Webhook (Recommended - easier setup)"
echo "   ✅ Simple to configure"
echo "   ✅ No app permissions needed"
echo "   ❌ Limited to one channel"
echo ""
echo "B) Slack App with Bot Token (Advanced)"
echo "   ✅ Can post to multiple channels"
echo "   ✅ More formatting options"
echo "   ❌ Requires app creation and token management"
echo ""
read -p "Choose option (A/B): " setup_choice

case $setup_choice in
    [Aa]* )
        echo ""
        print_step "2. Setting up Incoming Webhook"
        echo ""
        echo "📋 Follow these steps to create a Slack incoming webhook:"
        echo ""
        echo "1. Go to your Slack workspace"
        echo "2. Click on your workspace name (top left) → Settings & Administration → Manage Apps"
        echo "3. Search for 'Incoming Webhooks' and click 'Add to Slack'"
        echo "4. Choose the channel where you want notifications (e.g., #deployments, #ci-cd)"
        echo "5. Click 'Add Incoming WebHooks Integration'"
        echo "6. Copy the Webhook URL (it starts with https://hooks.slack.com/services/...)"
        echo ""
        echo "🔗 Direct link: https://slack.com/apps/A0F7XDUAZ-incoming-webhooks"
        echo ""
        echo "💡 Recommended channel names:"
        echo "   - #deployments"
        echo "   - #ci-cd"
        echo "   - #dev-notifications"
        echo "   - #job-tracker-updates"
        echo ""
        read -p "Press Enter when you have your webhook URL ready..."
        
        echo ""
        print_step "3. Configure GitHub Secret"
        echo ""
        echo "Now add your webhook URL to GitHub secrets:"
        echo ""
        echo "1. Go to: ${SECRETS_URL}"
        echo "2. Click 'New repository secret'"
        echo "3. Name: SLACK_WEBHOOK_URL"
        echo "4. Value: Paste your webhook URL (https://hooks.slack.com/services/...)"
        echo "5. Click 'Add secret'"
        echo ""
        ;;
    [Bb]* )
        echo ""
        print_step "2. Setting up Slack App with Bot Token"
        echo ""
        echo "📋 Follow these steps to create a Slack app:"
        echo ""
        echo "1. Go to https://api.slack.com/apps"
        echo "2. Click 'Create New App' → 'From scratch'"
        echo "3. App name: 'Job Tracker CI/CD Bot'"
        echo "4. Choose your workspace"
        echo "5. Go to 'OAuth & Permissions' in the sidebar"
        echo "6. Add these Bot Token Scopes:"
        echo "   - chat:write"
        echo "   - chat:write.public"
        echo "7. Click 'Install to Workspace'"
        echo "8. Copy the 'Bot User OAuth Token' (starts with xoxb-)"
        echo ""
        echo "🔗 Direct link: https://api.slack.com/apps"
        echo ""
        read -p "Press Enter when you have your bot token ready..."
        
        echo ""
        print_step "3. Configure GitHub Secrets"
        echo ""
        echo "Add your bot token to GitHub secrets:"
        echo ""
        echo "1. Go to: ${SECRETS_URL}"
        echo "2. Click 'New repository secret'"
        echo "3. Name: SLACK_BOT_TOKEN"
        echo "4. Value: Paste your bot token (xoxb-...)"
        echo "5. Click 'Add secret'"
        echo ""
        echo "⚠️ Note: This setup requires modifying the workflow to use the bot token instead of webhook."
        echo "   The current setup is configured for incoming webhooks."
        ;;
    * )
        print_warning "Invalid choice. Defaulting to Incoming Webhook setup."
        setup_choice="A"
        ;;
esac

echo ""
print_step "4. Test Your Setup"
echo ""
echo "Test your Slack notifications by triggering the CI/CD pipeline:"
echo ""
echo "# Method 1: Make a small change and push"
echo "echo '# Testing Slack notifications' >> README.md"
echo "git add README.md"
echo "git commit -m 'Test Slack notifications'"
echo "git push origin \$(git branch --show-current)"
echo ""
echo "# Method 2: Trigger workflow manually"
echo "# Go to: ${REPO_URL}/actions"
echo "# Click 'CI/CD Pipeline' → 'Run workflow'"
echo ""

print_step "5. Verify Notifications"
echo ""
echo "Your notifications will now trigger when:"
echo "✅ Any build completes (success, failure, or cancellation)"
echo "✅ Docker images are built and pushed"
echo "✅ Deployments to staging or production occur"
echo "✅ Pipeline fails at any stage"
echo ""
echo "What you'll see in Slack:"
echo "📊 Build status summary with emojis"
echo "📍 Branch and environment information"
echo "👤 Who triggered the pipeline"
echo "🔗 Direct links to view the pipeline and commit"
echo "📋 Individual job statuses"
echo ""

print_step "6. Customization Options"
echo ""
echo "You can customize the notifications by:"
echo ""
echo "• Changing the channel: Update the webhook to point to a different channel"
echo "• Modifying the message format: Edit the payload in .github/workflows/ci-cd.yml"
echo "• Adding @mentions: Include user/group mentions in the message"
echo "• Adding conditions: Modify when notifications are sent"
echo ""
echo "Example customizations:"
echo "• Only notify on failures: Change the 'if' condition in the workflow"
echo "• Add @channel for production deployments"
echo "• Include test coverage information"
echo "• Add custom fields for issue tracking"
echo ""

print_step "7. Troubleshooting"
echo ""
echo "If notifications aren't working:"
echo ""
echo "🔍 Check the GitHub Actions logs:"
echo "   ${REPO_URL}/actions"
echo ""
echo "🔍 Common issues:"
echo "   ❌ SLACK_WEBHOOK_URL secret not set or incorrect"
echo "   ❌ Webhook URL expired or disabled"
echo "   ❌ Channel was deleted or webhook permissions changed"
echo "   ❌ Pipeline didn't meet the trigger conditions"
echo ""
echo "🔍 Debug steps:"
echo "   1. Check if the 'notify' job ran in the Actions tab"
echo "   2. Look for the 'Fallback notification' output"
echo "   3. Verify the webhook URL is still valid"
echo "   4. Test the webhook URL manually with curl"
echo ""

echo ""
print_success "Slack Notifications Setup Complete!"
echo ""
echo "📋 Summary:"
echo "1. ✅ Updated CI/CD workflow to send better notifications"
echo "2. ✅ Provided setup instructions for Slack webhook"
echo "3. ✅ Notifications will now trigger on all pipeline runs"
echo "4. ✅ Added comprehensive status reporting with emojis and links"
echo ""
echo "🚀 Next Steps:"
echo "1. Add your SLACK_WEBHOOK_URL secret: ${SECRETS_URL}"
echo "2. Test with a commit or manual workflow trigger"
echo "3. Enjoy automated Slack notifications for your CI/CD pipeline!"
echo ""
echo "💡 Pro Tip: Create a dedicated #job-tracker-ci channel for these notifications"
echo "   to keep them organized and avoid spam in general channels."
echo "" 