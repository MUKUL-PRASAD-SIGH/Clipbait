#!/bin/bash
echo "🤖 Starting AI Transformation Service..."
echo "📦 Installing Python dependencies..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo "Please install Python 3.8+ from https://python.org"
    exit 1
fi

# Install dependencies
pip3 install -r requirements.txt

echo "🚀 Starting AI server on port 5001..."
python3 ai_server.py