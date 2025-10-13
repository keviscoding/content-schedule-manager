#!/bin/bash

echo "🔍 Checking Backend Status..."
echo ""

# Check if backend is running
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Backend is running on port 3001"
    curl -s http://localhost:3001/health | jq '.' 2>/dev/null || curl -s http://localhost:3001/health
else
    echo "❌ Backend is NOT running on port 3001"
    echo ""
    echo "Possible issues:"
    echo "1. Backend didn't start - check for errors in terminal"
    echo "2. Port 3001 is blocked"
    echo "3. Backend crashed"
    echo ""
    echo "Try starting backend manually:"
    echo "  cd backend && npm run dev"
fi

echo ""
echo "Checking if port 3001 is in use:"
lsof -ti:3001 || echo "Port 3001 is free"
