#!/usr/bin/env bash

# Script to fix Node.js version mismatch in Docker containers
# This script rebuilds the Docker images to use Node.js 20+
#
# Usage: ./fix-node-version.sh
#
# What this script does:
# 1. Stops all running containers
# 2. Removes old Docker images
# 3. Rebuilds images from scratch (no cache)
# 4. Starts containers with correct Node.js 20+
#
# Note: This script uses a fixed 5-second wait time for containers to start.
# If your system is slow, you may need to check logs manually after running.

set -e  # Exit on error

echo "================================================"
echo "🔧 Fixing Node.js Version Mismatch"
echo "================================================"
echo ""

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose not found"
    echo "   Please install Docker Compose first"
    exit 1
fi

# Check current running containers
echo "📋 Current container status:"
docker-compose ps
echo ""

# Stop containers
echo "⏹️  Stopping containers..."
docker-compose down
echo ""

# Remove old images
echo "🗑️  Removing old images..."
REMOVED_ANY=false

if docker images | grep -q "solid-umbrella-backend"; then
    docker rmi solid-umbrella-backend:latest 2>/dev/null || true
    echo "   ✅ Backend image removed"
    REMOVED_ANY=true
fi

if docker images | grep -q "solid-umbrella-frontend"; then
    docker rmi solid-umbrella-frontend:latest 2>/dev/null || true
    echo "   ✅ Frontend image removed"
    REMOVED_ANY=true
fi

if [ "$REMOVED_ANY" = false ]; then
    echo "   ℹ️  No old images found (first time setup?)"
fi
echo ""

# Rebuild without cache
echo "🔨 Rebuilding images (this may take a few minutes)..."
echo "   Building backend..."
docker-compose build --no-cache backend
echo "   Building frontend..."
docker-compose build --no-cache frontend
echo "   ✅ All images rebuilt"
echo ""

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d
echo ""

# Wait a bit for containers to start
echo "⏳ Waiting for containers to start..."
sleep 5
echo ""

# Check Node version
echo "📊 Verifying Node.js version..."
if NODE_VERSION=$(docker-compose exec -T backend node --version 2>&1); then
    echo ""
    echo "✅ Backend is now using: $NODE_VERSION"
    echo ""
    
    # Check if it's Node 20+
    MAJOR_VERSION=$(echo "$NODE_VERSION" | cut -d'v' -f2 | cut -d'.' -f1)
    if [[ "$MAJOR_VERSION" =~ ^[0-9]+$ ]] && [ "$MAJOR_VERSION" -ge 20 ]; then
        echo "✅ SUCCESS! Node.js version is correct (20+)"
    else
        echo "⚠️  WARNING: Node.js version is still below 20"
        echo "   Something went wrong, please check the Dockerfile"
    fi
else
    echo "⚠️  Container might still be starting, check logs with:"
    echo "   docker-compose logs -f backend"
fi

echo ""
echo "================================================"
echo "📋 Next Steps:"
echo "================================================"
echo ""
echo "1. Check container status:"
echo "   docker-compose ps"
echo ""
echo "2. View backend logs:"
echo "   docker-compose logs -f backend"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "4. If still having issues, see:"
echo "   DOCKER_TROUBLESHOOTING.md"
echo ""
