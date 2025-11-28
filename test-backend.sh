#!/bin/bash

# Test Backend Server Setup
echo "🧪 Testing Backend Server Setup"
echo "================================"
echo ""

# Check if server directory exists
if [ ! -d "server" ]; then
    echo "❌ Error: server/ directory not found"
    exit 1
fi

echo "✅ Server directory found"

# Check if package.json exists
if [ ! -f "server/package.json" ]; then
    echo "❌ Error: server/package.json not found"
    exit 1
fi

echo "✅ Server package.json found"

# Check if dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "⚠️  Server dependencies not installed"
    echo "   Run: cd server && npm install"
    exit 1
fi

echo "✅ Server dependencies installed"

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found, creating from template..."
    cp server/.env.example server/.env
    echo "⚠️  Please add your GEMINI_API_KEY to server/.env"
fi

echo "✅ Server .env file exists"

# Check if TypeScript compiles
echo ""
echo "🔍 Checking TypeScript compilation..."
cd server
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

cd ..

# Try to build
echo ""
echo "🔨 Building server..."
cd server
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Server build successful"
else
    echo "❌ Server build failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 All tests passed!"
echo ""
echo "To start the server:"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "Or use the quick start script:"
echo "  ./start.sh"
