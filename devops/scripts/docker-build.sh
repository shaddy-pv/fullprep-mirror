#!/bin/bash

# =============================================
# Docker Build Script
# Builds frontend and backend images locally
# =============================================

set -e

echo "🐳 Starting Docker build process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build Frontend
echo -e "${YELLOW}📦 Building Frontend Docker image...${NC}"
docker build -t fullprep-frontend:latest -f Dockerfile .
echo -e "${GREEN}✅ Frontend image built successfully${NC}"

# Build Backend
echo -e "${YELLOW}📦 Building Backend Docker image...${NC}"
docker build -t fullprep-backend:latest -f backend/Dockerfile ./backend
echo -e "${GREEN}✅ Backend image built successfully${NC}"

echo -e "${GREEN}🎉 All images built successfully!${NC}"
echo ""
echo "Available images:"
docker images | grep fullprep
