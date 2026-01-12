#!/bin/bash
set -e

# Function to handle cleanup
cleanup() {
    echo "Stopping services..."
    if [ ! -z "$PYTHON_PID" ]; then
        kill $PYTHON_PID
    fi
    exit
}

trap cleanup SIGINT SIGTERM EXIT

echo "=== Starting Certchain Project on Linux ==="

# 0. Start Database
echo "[0/3] Starting Database..."
docker compose up -d
echo "Waiting for database to be ready..."
sleep 5

# 1. Setup and Start Python Backend
echo "[1/2] Setting up Python Backend..."
cd backend/blockchain/client

# Create venv if not exists
if [ ! -d "venv_linux" ]; then
    echo "Creating Python virtual environment (venv_linux)..."
    python3 -m venv venv_linux
    source venv_linux/bin/activate
    
    echo "Installing Python dependencies..."
    pip install -r requirements.txt
else
    source venv_linux/bin/activate
fi

# Check configuration (Update Program ID if needed)
# Assuming main.py or config.py reads from env or has constants.
# We might need to verify if config.py needs update.

echo "Starting Python Backend (main.py)..."
python3 main.py &
PYTHON_PID=$!
echo "Python Backend running with PID: $PYTHON_PID"

# 2. Start Frontend
echo "[2/2] Starting Next.js Frontend..."
cd ../../../

echo "Running npm run dev..."
npm run dev
