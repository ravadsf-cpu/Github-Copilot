#!/bin/bash
# Quick restart script for Cleary app

echo "🔄 Restarting Cleary..."
echo ""

# Kill existing processes
echo "📦 Stopping old processes..."
pkill -f "react-scripts start" 2>/dev/null
pkill -f "node server/index.js" 2>/dev/null
sleep 1

# Start backend
echo "🚀 Starting backend server..."
cd "/Users/adisanghavi/Github Copilot/cleary"
node server/index.js &
SERVER_PID=$!
echo "   Backend PID: $SERVER_PID"
sleep 2

# Start frontend
echo "🎨 Starting frontend..."
npm start &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Cleary is restarting!"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5001"
echo ""
echo "🛑 To stop:"
echo "   kill $SERVER_PID $FRONTEND_PID"
echo "   OR press Ctrl+C twice"
echo ""
