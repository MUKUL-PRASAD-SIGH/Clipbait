#!/bin/bash

# Epitychia Deployment Script
set -e

echo "🚀 Starting Epitychia deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy .env.production to .env and configure it."
    exit 1
fi

# Load environment variables
source .env

# Build and deploy with Docker Compose
echo "📦 Building and starting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if backend is healthy
echo "🔍 Checking backend health..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npm run migrate

echo "✅ Deployment completed successfully!"
echo "🌐 Backend API: http://localhost:3000"
echo "📊 Check logs: docker-compose -f docker-compose.prod.yml logs -f"