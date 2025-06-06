#!/bin/bash

# Test Slack Webhook Script
# This script tests if your Slack webhook URL is working

echo "🧪 Slack Webhook Tester"
echo "======================="
echo ""

# Check if webhook URL is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <webhook-url>"
    echo ""
    echo "Example:"
    echo "  $0 https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
    echo ""
    echo "💡 Get your webhook URL from:"
    echo "   1. Go to https://api.slack.com/apps"
    echo "   2. Create or select your app"
    echo "   3. Go to 'Incoming Webhooks'"
    echo "   4. Copy the webhook URL"
    exit 1
fi

WEBHOOK_URL="$1"

echo "🔗 Testing webhook URL: ${WEBHOOK_URL:0:50}..."
echo ""

# Test payload
PAYLOAD='{
    "text": "🧪 Test message from Job Application Tracker CI/CD",
    "blocks": [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Job Application Tracker CI/CD Test*\n✅ Your Slack webhook is working correctly!\n🧪 *Test Status:* Success\n📍 *Environment:* Local Test\n👤 *Triggered by:* Manual test"
            }
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": "*Webhook Test:*\n✅ Connection successful"
                },
                {
                    "type": "mrkdwn",
                    "text": "*Message Format:*\n✅ Rich blocks supported"
                }
            ]
        }
    ]
}'

# Send test message
echo "📤 Sending test message..."
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -X POST \
    -H 'Content-type: application/json' \
    --data "$PAYLOAD" \
    "$WEBHOOK_URL")

# Extract HTTP status code
HTTP_CODE=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo ""
echo "📊 Test Results:"
echo "==============="

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ SUCCESS: Webhook test passed!"
    echo "   - HTTP Status: $HTTP_CODE"
    echo "   - Response: $RESPONSE_BODY"
    echo ""
    echo "🎉 Your Slack webhook is working correctly!"
    echo "   Check your Slack channel for the test message."
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Add this webhook URL to GitHub secrets as SLACK_WEBHOOK_URL"
    echo "   2. Go to: https://github.com/jnleyva816/Job-Application-Tracker/settings/secrets/actions"
    echo "   3. Create new secret: SLACK_WEBHOOK_URL"
    echo "   4. Paste your webhook URL as the value"
else
    echo "❌ FAILED: Webhook test failed!"
    echo "   - HTTP Status: $HTTP_CODE"
    echo "   - Response: $RESPONSE_BODY"
    echo ""
    echo "🔍 Troubleshooting:"
    
    case $HTTP_CODE in
        404)
            echo "   ❌ Webhook not found (404)"
            echo "      - Check if the webhook URL is correct"
            echo "      - Verify the webhook hasn't been deleted"
            ;;
        401|403)
            echo "   ❌ Unauthorized (${HTTP_CODE})"
            echo "      - Webhook URL might be invalid"
            echo "      - Check if the app has been uninstalled"
            ;;
        400)
            echo "   ❌ Bad request (400)"
            echo "      - Payload format might be incorrect"
            echo "      - This is likely a script issue, not your webhook"
            ;;
        500)
            echo "   ❌ Slack server error (500)"
            echo "      - Temporary Slack issue, try again later"
            ;;
        *)
            echo "   ❌ Unexpected error (${HTTP_CODE})"
            echo "      - Check your internet connection"
            echo "      - Try again in a few minutes"
            ;;
    esac
    
    echo ""
    echo "🛠️ How to fix:"
    echo "   1. Go to https://api.slack.com/apps"
    echo "   2. Find your app (or create a new one)"
    echo "   3. Go to 'Incoming Webhooks' → Enable if needed"
    echo "   4. Create a new webhook URL"
    echo "   5. Test again with the new URL"
fi

echo ""
echo "📋 Manual test command:"
echo "curl -X POST -H 'Content-type: application/json' \\"
echo "  --data '{\"text\":\"Test from curl\"}' \\"
echo "  '$WEBHOOK_URL'" 