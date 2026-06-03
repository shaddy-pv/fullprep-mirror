#!/bin/bash

# =============================================
# Docker Cleanup Script
# Removes containers, images, and volumes
# =============================================

set -e

echo "🧹 Cleaning up Docker resources..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop all containers
echo -e "${YELLOW}🛑 Stopping all containers...${NC}"
docker-compose down

# Remove volumes (optional - prompts user)
read -p "$(echo -e ${RED}Do you want to remove volumes? This will delete all data! [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  Removing volumes...${NC}"
    docker-compose down -v
fi

# Remove images
read -p "$(echo -e ${YELLOW}Do you want to remove images? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🗑️  Removing images...${NC}"
    docker rmi fullprep-frontend:latest fullprep-backend:latest 2>/dev/null || true
fi

# Prune system
read -p "$(echo -e ${YELLOW}Do you want to prune Docker system? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🧹 Pruning Docker system...${NC}"
    docker system prune -f
fi

echo -e "${GREEN}✅ Cleanup complete!${NC}"
