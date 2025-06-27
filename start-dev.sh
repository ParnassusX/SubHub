#!/bin/bash

# SubHub Development Server Startup Script
# This script starts the development server for SubHub

echo "🚀 Starting SubHub Development Server..."
echo "📁 Project: SubHub - Subscription Management System"
echo "🌐 URL: http://localhost:3000"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies ready"
echo "🔧 Starting development server..."
echo ""
echo "📖 Available pages:"
echo "   • Home: http://localhost:3000"
echo "   • Dashboard: http://localhost:3000/dashboard.html"
echo "   • Landing Page: http://localhost:3000/landing-page.html"
echo "   • Add Subscriptions: http://localhost:3000/add-subscriptions.html"
echo "   • Reports: http://localhost:3000/reports.html"
echo "   • Settings: http://localhost:3000/settings.html"
echo "   • And more..."
echo ""
echo "💡 Press Ctrl+C to stop the server"
echo "🔄 The server will automatically open in your browser"
echo ""

# Start the development server
npm start
