#!/bin/bash

# Quick verification script for Docker authentication fix
echo "🔍 Verifying Docker Authentication Fix"
echo "======================================"

# Check if workflow file exists
if [ ! -f ".github/workflows/ci-cd.yml" ]; then
    echo "❌ CI/CD workflow file not found"
    exit 1
fi

echo "✅ CI/CD workflow file found"

# Check for Docker Hub authentication (should exist)
if grep -A 10 "Log in to Docker Hub" .github/workflows/ci-cd.yml | grep -q "DOCKERHUB_USERNAME"; then
    echo "✅ Docker Hub authentication configured"
else
    echo "❌ Docker Hub authentication not found"
fi

# Check that ecr: auto is NOT present (this was the problem)
if grep -A 5 "docker/login-action" .github/workflows/ci-cd.yml | grep -q "ecr: auto"; then
    echo "❌ Found 'ecr: auto' - this will cause authentication issues!"
    echo "   This parameter tries to authenticate with AWS ECR instead of Docker Hub"
else
    echo "✅ No conflicting 'ecr: auto' parameter found"
fi

# Check for logout parameter
if grep -A 10 "Log in to Docker Hub" .github/workflows/ci-cd.yml | grep -q "logout: true"; then
    echo "✅ Docker logout configured"
else
    echo "⚠️ Docker logout not configured (optional but recommended)"
fi

# Check for separate ECR configuration
if grep -q "Log in to Amazon ECR" .github/workflows/ci-cd.yml; then
    echo "✅ Separate ECR authentication found"
else
    echo "ℹ️ No ECR authentication (this is fine if you only use Docker Hub)"
fi

# Check for continue-on-error for ECR steps
if grep -B 2 -A 2 "Log in to Amazon ECR" .github/workflows/ci-cd.yml | grep -q "continue-on-error: true"; then
    echo "✅ ECR authentication has continue-on-error (good)"
else
    echo "ℹ️ ECR authentication might fail if AWS credentials not set"
fi

echo ""
echo "📋 Summary"
echo "=========="
echo "The Docker authentication fix removes the conflicting 'ecr: auto' parameter"
echo "that was trying to authenticate with AWS ECR using Docker Hub credentials."
echo ""
echo "✅ Primary fix: Removed 'ecr: auto' from Docker Hub login"
echo "✅ Enhancement: Added separate ECR authentication (optional)"
echo "✅ Safety: ECR steps won't fail pipeline if AWS not configured"
echo ""
echo "Next step: Ensure your GitHub secrets are set:"
echo "- DOCKERHUB_USERNAME: Your Docker Hub username"
echo "- DOCKERHUB_TOKEN: Docker Hub access token (not password)"
echo ""
echo "Test by pushing to 'develop' or 'main' branch and checking GitHub Actions." 