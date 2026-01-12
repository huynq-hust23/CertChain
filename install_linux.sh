#!/bin/bash
set -e

echo "=== Installing Certchain Dependencies (Linux) ==="

# 1. Frontend Dependencies
echo "[1/2] Installing Frontend dependencies..."
npm install

# 2. Backend Dependencies
echo "[2/2] Installing Backend dependencies..."
cd backend/blockchain/client

if [ ! -d "venv_linux" ]; then
    echo "Creating Python virtual environment (venv_linux)..."
    python3 -m venv venv_linux
fi

source venv_linux/bin/activate

echo "Installing requirements..."
pip install -r requirements.txt

echo ""
echo "=== Installation Complete! ==="
echo "You can now run the project using ./run_linux.sh"
