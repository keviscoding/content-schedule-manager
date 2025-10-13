#!/bin/bash

echo "🔍 Checking Content Schedule Manager Setup..."
echo "=============================================="
echo ""

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not installed"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi

# Check npm
echo ""
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ npm installed: $NPM_VERSION"
else
    echo "❌ npm not installed"
    exit 1
fi

# Check dependencies
echo ""
echo "📚 Checking dependencies..."
if [ -d "node_modules" ] && [ -d "backend/node_modules" ] && [ -d "frontend/node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Dependencies not fully installed"
    echo "   Run: npm run install:all"
fi

# Check MongoDB
echo ""
echo "🍃 Checking MongoDB..."
if pgrep -x mongod > /dev/null; then
    echo "✅ MongoDB is running"
    MONGODB_STATUS="running"
elif command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB installed but not running"
    echo "   Start with: brew services start mongodb-community"
    MONGODB_STATUS="installed"
else
    echo "⚠️  MongoDB not installed locally"
    echo "   Option 1: Use MongoDB Atlas (cloud) - Recommended"
    echo "   Option 2: Install locally: brew install mongodb-community"
    MONGODB_STATUS="not-installed"
fi

# Check .env files
echo ""
echo "⚙️  Checking configuration..."
if [ -f "backend/.env" ]; then
    echo "✅ Backend .env exists"
    
    # Check if MongoDB URI is set
    if grep -q "MONGODB_URI=" backend/.env; then
        MONGO_URI=$(grep "MONGODB_URI=" backend/.env | cut -d '=' -f2)
        if [[ $MONGO_URI == *"localhost"* ]] && [ "$MONGODB_STATUS" != "running" ]; then
            echo "⚠️  Using local MongoDB but it's not running"
        elif [[ $MONGO_URI == *"mongodb+srv"* ]]; then
            echo "✅ Using MongoDB Atlas (cloud)"
        fi
    fi
else
    echo "❌ Backend .env not found"
    echo "   Run: cp backend/.env.example backend/.env"
fi

if [ -f "frontend/.env" ]; then
    echo "✅ Frontend .env exists"
else
    echo "❌ Frontend .env not found"
    echo "   Run: cp frontend/.env.example frontend/.env"
fi

# Summary
echo ""
echo "=============================================="
echo "📋 Summary:"
echo ""

if [ "$MONGODB_STATUS" = "running" ]; then
    echo "✅ Everything looks good!"
    echo ""
    echo "🚀 Ready to start:"
    echo "   npm run dev"
    echo ""
    echo "Then open: http://localhost:5173"
elif [ "$MONGODB_STATUS" = "installed" ]; then
    echo "⚠️  Almost ready! Start MongoDB first:"
    echo ""
    echo "   brew services start mongodb-community"
    echo ""
    echo "Then run:"
    echo "   npm run dev"
elif [ "$MONGODB_STATUS" = "not-installed" ]; then
    echo "⚠️  MongoDB not installed"
    echo ""
    echo "Choose one option:"
    echo ""
    echo "Option 1 (Easiest): Use MongoDB Atlas"
    echo "  1. Go to: https://www.mongodb.com/cloud/atlas/register"
    echo "  2. Create free cluster"
    echo "  3. Get connection string"
    echo "  4. Update backend/.env with:"
    echo "     MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname"
    echo "  5. Run: npm run dev"
    echo ""
    echo "Option 2: Install MongoDB locally"
    echo "  1. Run: brew tap mongodb/brew"
    echo "  2. Run: brew install mongodb-community"
    echo "  3. Run: brew services start mongodb-community"
    echo "  4. Run: npm run dev"
fi

echo ""
echo "📖 For more help, see:"
echo "   - PLAY_NOW.md (quick start)"
echo "   - QUICKSTART.md (5-minute setup)"
echo "   - HOW_TO_USE.md (complete guide)"
