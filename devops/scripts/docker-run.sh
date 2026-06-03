#!/bin/bash

# =============================================
# Docker Run Script
# Starts all services using Docker Compose
# =============================================

set -e

echo "🚀 Starting FullPrep services..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Copying from .env.docker...${NC}"
    cp .env.docker .env
fi

# Start services
echo -e "${YELLOW}🐳 Starting Docker Compose services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service status
echo -e "${GREEN}📊 Service Status:${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Services started successfully!${NC}"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  MongoDB:  mongodb://localhost:27017"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop services: docker-compose down"
