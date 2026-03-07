#!/bin/bash
# ============================================
# Student Portfolio - Start Both Servers
# ============================================

echo ""
echo "========================================"
echo "  Student Portfolio v2 - Python Server"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python is not installed"
    echo "Please install Python 3.8+ from https://python.org"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

# Install Python dependencies if needed
if [ ! -d "server/venv" ]; then
    echo "Installing Python dependencies..."
    cd server
    pip install -r requirements.txt
    cd ..
fi

echo ""
echo "Starting Python FastAPI server on http://localhost:8000..."
cd server
python3 main.py &
PYTHON_PID=$!
cd ..

# Wait for Python server to start
sleep 3

echo ""
echo "Starting React dev server on http://localhost:3000..."
echo ""
echo "========================================"
echo "Both servers are now running!"
echo "========================================"
echo ""
echo "- React App:    http://localhost:3000"
echo "- Python API:   http://localhost:8000"
echo "- Health:       http://localhost:8000/health"
echo ""

# Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    open http://localhost:3000
fi

echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "kill $PYTHON_PID 2>/dev/null; exit" INT TERM
wait
