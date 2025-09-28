#!/bin/bash

# Epitychia MVP Deployment Script
set -e

echo "🚀 Starting Epitychia MVP Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.production .env
    echo "⚠️  Please edit .env file with your actual values before continuing!"
    echo "   Required: POSTGRES_PASSWORD, JWT_SECRET, ENCRYPTION_KEY, Firebase keys"
    read -p "Press Enter after editing .env file..."
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Services are healthy!"
else
    echo "❌ Services are not responding. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

echo "🎉 Deployment complete!"
echo ""
echo "📱 Your Epitychia MVP is now running:"
echo "   🌐 Web App: http://localhost"
echo "   🔧 API: http://localhost/api"
echo "   📊 Desktop App: http://localhost:1420"
echo ""
echo "📋 Next steps:"
echo "   1. Install the Chrome extension from chrome-extension/ folder"
echo "   2. Create a user account at http://localhost"
echo "   3. Login in the Chrome extension popup"
echo "   4. Start copying text - it will be automatically captured!"
echo ""
echo "🛠️  Useful commands:"
echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop services: docker-compose -f docker-compose.prod.yml down"
echo "   Restart: docker-compose -f docker-compose.prod.yml restart"