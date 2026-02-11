#!/bin/bash

# Script to run the application locally
# This runs frontend and API separately for better reliability

echo "🚀 Starting Career Confidence Kit Locally..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env and add your OPENAI_API_KEY"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "Choose how to run:"
echo "1) Frontend only (npm run dev) - Fast, but API won't work"
echo "2) Full app with Vercel (vercel dev) - May have blank page issues"
echo "3) Frontend + API separately (Recommended)"
echo ""
read -p "Enter choice (1/2/3): " choice

case $choice in
    1)
        echo "Starting frontend only..."
        npm run dev
        ;;
    2)
        echo "Starting with Vercel dev..."
        echo "If you see blank page, check browser console (F12) for errors"
        vercel dev --listen 3000
        ;;
    3)
        echo "Starting frontend and API separately..."
        echo ""
        echo "📱 Frontend will run on: http://localhost:8080"
        echo "🔌 API will run on: http://localhost:3001"
        echo ""
        echo "Opening two terminals..."
        echo "Terminal 1: Frontend (npm run dev)"
        echo "Terminal 2: API (vercel dev --listen 3001)"
        echo ""
        echo "Starting frontend in this terminal..."
        echo "Open a NEW terminal and run: vercel dev --listen 3001"
        echo ""
        npm run dev
        ;;
    *)
        echo "Invalid choice. Running frontend only..."
        npm run dev
        ;;
esac
