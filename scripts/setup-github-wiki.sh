#!/bin/bash

# GitHub Wiki Setup Script for Job Application Tracker
# This script helps transfer content from WIKI folder to GitHub Wiki

echo "🚀 Setting up GitHub Wiki for Job Application Tracker"
echo "======================================================"

# Repository details
REPO_USER="jnleyva816" 
REPO_NAME="Job-Application-Tracker"
WIKI_URL="https://github.com/${REPO_USER}/${REPO_NAME}.wiki.git"

echo ""
echo "📋 Prerequisites:"
echo "1. Enable Wiki in your GitHub repository settings"
echo "2. Create the first page in GitHub Wiki (can be empty)"
echo "3. Clone the wiki repository locally"
echo ""

# Check if wiki directory exists
if [ ! -d "../WIKI" ]; then
    echo "❌ WIKI directory not found. Please run this script from the scripts/ directory."
    exit 1
fi

echo "🔧 Instructions to clone and setup GitHub Wiki:"
echo ""
echo "1. Clone the wiki repository:"
echo "   git clone ${WIKI_URL}"
echo ""
echo "2. Navigate to the wiki directory:"
echo "   cd ${REPO_NAME}.wiki"
echo ""
echo "3. Copy this script's output files to the wiki directory"
echo ""

# Create wiki-ready files
WIKI_OUTPUT_DIR="../wiki-content"
mkdir -p "$WIKI_OUTPUT_DIR"

echo "📝 Converting WIKI files to GitHub Wiki format..."

# Home page (from WIKI/README.md)
if [ -f "../WIKI/README.md" ]; then
    echo "   ✅ Creating Home.md (Wiki homepage)"
    cp "../WIKI/README.md" "$WIKI_OUTPUT_DIR/Home.md"
fi

# Convert all other markdown files
for file in ../WIKI/*.md; do
    if [ -f "$file" ] && [ "$(basename "$file")" != "README.md" ]; then
        filename=$(basename "$file" .md)
        echo "   ✅ Converting $(basename "$file") to ${filename}.md"
        
        # GitHub Wiki pages should not have spaces in filenames
        wiki_filename=$(echo "$filename" | sed 's/[^a-zA-Z0-9-]/-/g')
        cp "$file" "$WIKI_OUTPUT_DIR/${wiki_filename}.md"
    fi
done

echo ""
echo "📁 Wiki content ready in: $WIKI_OUTPUT_DIR"
echo ""
echo "🚀 Next steps:"
echo "1. Clone the wiki repository:"
echo "   git clone ${WIKI_URL}"
echo ""
echo "2. Copy files from wiki-content/ to the wiki repository:"
echo "   cp wiki-content/* ${REPO_NAME}.wiki/"
echo ""
echo "3. Commit and push to GitHub Wiki:"
echo "   cd ${REPO_NAME}.wiki"
echo "   git add ."
echo "   git commit -m 'Initial wiki setup with comprehensive documentation'"
echo "   git push origin master"
echo ""
echo "4. Your GitHub Wiki will be available at:"
echo "   https://github.com/${REPO_USER}/${REPO_NAME}/wiki"
echo ""

# Create a sidebar for navigation
echo "📋 Creating _Sidebar.md for wiki navigation..."
cat > "$WIKI_OUTPUT_DIR/_Sidebar.md" << 'EOF'
# Job Application Tracker Wiki

## Getting Started
* [Home](Home)
* [Quick Start Guide](Quick-Start-Guide)
* [Docker Guide](Docker-Guide)

## Development
* [Backend Development](Backend-Development)
* [Frontend Development](Frontend-Development)
* [Testing Guide](Testing-Guide)

## DevOps
* [CI/CD Pipeline](CI-CD-Pipeline)
* [Deployment Guide](Deployment-Guide)
* [Monitoring & Observability](Monitoring-Observability)

## Operations
* [Troubleshooting Guide](Troubleshooting-Guide)
* [Performance Optimization](Performance-Optimization)
* [Security Guide](Security-Guide)

## Team & Process
* [Contributing Guidelines](https://github.com/jnleyva816/Job-Application-Tracker/tree/main/CONTRIBUTING)
* [Code Review Process](Code-Review-Process)
* [Release Process](Release-Process)

---
*📚 Complete documentation for the Job Application Tracker project*
EOF

echo "   ✅ Created _Sidebar.md for navigation"

# Create a footer
echo "📋 Creating _Footer.md for wiki footer..."
cat > "$WIKI_OUTPUT_DIR/_Footer.md" << 'EOF'
---

**[Job Application Tracker](https://github.com/jnleyva816/Job-Application-Tracker)** | **[Issues](https://github.com/jnleyva816/Job-Application-Tracker/issues)** | **[Discussions](https://github.com/jnleyva816/Job-Application-Tracker/discussions)** | **[Contributing](https://github.com/jnleyva816/Job-Application-Tracker/tree/main/CONTRIBUTING)**

*This documentation is maintained by the Job Application Tracker development team and community contributors.*

*Last updated: June 2025*
EOF

echo "   ✅ Created _Footer.md for footer"

echo ""
echo "✨ Setup complete! Your wiki content is ready to be uploaded to GitHub Wiki."
echo ""
echo "💡 Pro tip: After setting up, you can edit wiki pages directly in GitHub's web interface"
echo "    or continue to use local editing with git commands." 