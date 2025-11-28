#!/bin/bash

# CrewAI Orchestrator - Quick Start Script
# This script starts both backend and frontend servers

echo "🚀 ════════════════════════════════════════════════════════════"
echo "🤖 CrewAI Orchestrator - Starting Application"
echo "🚀 ════════════════════════════════════════════════════════════"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version must be 18 or higher"
    echo "   Current version: $(node -v)"
    exit 1
fi

# Check if backend .env exists
if [ ! -f "server/.env" ]; then
    echo "⚠️  Backend .env file not found!"
    echo "   Creating from template..."
    cp server/.env.example server/.env
    echo ""
    echo "⚠️  IMPORTANT: Add your GEMINI_API_KEY to server/.env"
    echo "   Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
    read -p "Press Enter to continue after adding your API key..."
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if backend dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd server && npm install && cd ..
fi

echo ""
echo "✅ All dependencies installed"
echo ""

# Start backend in background
echo "🔧 Starting backend server on port 8000..."
cd server
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if ! curl -s http://localhost:8000/health > /dev/null; then
    echo "❌ Backend failed to start. Check backend.log for errors."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend server running (PID: $BACKEND_PID)"
echo ""

# Start frontend
echo "🎨 Starting frontend on port 3000..."
echo ""
echo "🚀 ════════════════════════════════════════════════════════════"
echo "📍 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "🚀 ════════════════════════════════════════════════════════════"
echo ""
echo "💡 Press Ctrl+C to stop both servers"
echo ""

# Start frontend (this will block until Ctrl+C)
npm run dev

# Cleanup on exit
echo ""
echo "👋 Shutting down servers..."
kill $BACKEND_PID 2>/dev/null
echo "✅ Servers stopped"
