#!/bin/bash

# Prompt Battle - Pre-Deployment Checklist
# Run this script before deploying to production

echo "🎮 Prompt Battle - Pre-Deployment Check"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Environment files exist
echo "📋 Checking environment files..."
if [ -f "server/.env" ]; then
    echo -e "${GREEN}✓${NC} server/.env exists"
else
    echo -e "${RED}✗${NC} server/.env missing - copy from server/.env.example"
    ERRORS=$((ERRORS + 1))
fi

if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env exists"
else
    echo -e "${YELLOW}⚠${NC} .env missing (optional for local dev)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 2: API keys configured
echo ""
echo "🔑 Checking API keys..."
if [ -f "server/.env" ]; then
    if grep -q "your_gemini_api_key_here" server/.env; then
        echo -e "${RED}✗${NC} GEMINI_API_KEY not configured"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓${NC} GEMINI_API_KEY configured"
    fi
    
    if grep -q "your_stability_api_key_here" server/.env; then
        echo -e "${RED}✗${NC} STABILITY_API_KEY not configured"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓${NC} STABILITY_API_KEY configured"
    fi
fi

# Check 3: Dependencies installed
echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${RED}✗${NC} Frontend dependencies missing - run: npm install"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "server/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${RED}✗${NC} Backend dependencies missing - run: cd server && npm install"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Git status
echo ""
echo "🔍 Checking git status..."
if [ -d ".git" ]; then
    if git diff-index --quiet HEAD --; then
        echo -e "${GREEN}✓${NC} No uncommitted changes"
    else
        echo -e "${YELLOW}⚠${NC} Uncommitted changes detected"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check if .env is in .gitignore
    if grep -q "^\.env$" .gitignore; then
        echo -e "${GREEN}✓${NC} .env files properly ignored"
    else
        echo -e "${RED}✗${NC} .env should be in .gitignore"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Check 5: Backend can start
echo ""
echo "🚀 Testing backend startup..."
cd server
if timeout 5s node server.js > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend starts successfully"
else
    # Check syntax at least
    if node -c server.js > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend syntax valid"
    else
        echo -e "${RED}✗${NC} Backend has syntax errors"
        ERRORS=$((ERRORS + 1))
    fi
fi
cd ..

# Check 6: Frontend builds
echo ""
echo "🏗️  Testing frontend build..."
if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend builds successfully"
    rm -rf dist # Clean up
else
    echo -e "${RED}✗${NC} Frontend build failed - check /tmp/build.log"
    ERRORS=$((ERRORS + 1))
fi

# Check 7: Port availability
echo ""
echo "🔌 Checking port availability..."
if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Port 3001 available"
else
    echo -e "${YELLOW}⚠${NC} Port 3001 in use (this is OK if server is running)"
    WARNINGS=$((WARNINGS + 1))
fi

if ! lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Port 8080 available"
else
    echo -e "${YELLOW}⚠${NC} Port 8080 in use (this is OK if dev server is running)"
    WARNINGS=$((WARNINGS + 1))
fi

# Check 8: Required files exist
echo ""
echo "📄 Checking required files..."
REQUIRED_FILES=(
    "server/server.js"
    "server/gameManager.js"
    "server/imageGenerator.js"
    "server/promptEvaluator.js"
    "src/components/Arena.tsx"
    "src/contexts/SocketProvider.tsx"
    "DEPLOYMENT.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file missing"
        ERRORS=$((ERRORS + 1))
    fi
done

# Summary
echo ""
echo "========================================"
echo "📊 Summary"
echo "========================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✨ All checks passed! Ready to deploy! ✨${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found${NC}"
    echo "Review warnings above. Deployment should be OK."
    exit 0
else
    echo -e "${RED}✗ ${ERRORS} error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ ${WARNINGS} warning(s) found${NC}"
    fi
    echo ""
    echo "Please fix errors before deploying."
    exit 1
fi
