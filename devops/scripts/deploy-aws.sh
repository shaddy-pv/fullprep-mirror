#!/bin/bash

# =============================================
# AWS Deployment Script
# Deploys to AWS ECS using AWS CLI
# =============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPO_FRONTEND="${ECR_REPO_FRONTEND:-fullprep-frontend}"
ECR_REPO_BACKEND="${ECR_REPO_BACKEND:-fullprep-backend}"
ECS_CLUSTER="${ECS_CLUSTER:-fullprep-cluster}"
ECS_SERVICE_FRONTEND="${ECS_SERVICE_FRONTEND:-fullprep-frontend-service}"
ECS_SERVICE_BACKEND="${ECS_SERVICE_BACKEND:-fullprep-backend-service}"

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  FullPrep AWS Deployment Script${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi

# Check if logged in to AWS
echo -e "${YELLOW}🔍 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Not logged in to AWS. Please configure credentials.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ AWS credentials verified${NC}"

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}📝 AWS Account ID: ${AWS_ACCOUNT_ID}${NC}"

# Login to ECR
echo -e "${YELLOW}🔐 Logging in to Amazon ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
echo -e "${GREEN}✅ Logged in to ECR${NC}"

# Build images
echo -e "${YELLOW}🏗️  Building Docker images...${NC}"
docker build -t ${ECR_REPO_FRONTEND}:latest -f Dockerfile .
docker build -t ${ECR_REPO_BACKEND}:latest -f backend/Dockerfile ./backend
echo -e "${GREEN}✅ Images built successfully${NC}"

# Tag images
echo -e "${YELLOW}🏷️  Tagging images...${NC}"
docker tag ${ECR_REPO_FRONTEND}:latest \
    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_FRONTEND}:latest
docker tag ${ECR_REPO_BACKEND}:latest \
    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_BACKEND}:latest
echo -e "${GREEN}✅ Images tagged${NC}"

# Push images to ECR
echo -e "${YELLOW}⬆️  Pushing images to ECR...${NC}"
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_FRONTEND}:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_BACKEND}:latest
echo -e "${GREEN}✅ Images pushed to ECR${NC}"

# Update ECS services
echo -e "${YELLOW}🚀 Updating ECS services...${NC}"
aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE_FRONTEND} \
    --force-new-deployment \
    --region ${AWS_REGION} > /dev/null

aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE_BACKEND} \
    --force-new-deployment \
    --region ${AWS_REGION} > /dev/null

echo -e "${GREEN}✅ ECS services updated${NC}"

# Wait for deployment
echo -e "${YELLOW}⏳ Waiting for deployment to stabilize...${NC}"
aws ecs wait services-stable \
    --cluster ${ECS_CLUSTER} \
    --services ${ECS_SERVICE_FRONTEND} ${ECS_SERVICE_BACKEND} \
    --region ${AWS_REGION}

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}🎉 Deployment Summary${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "Region: ${AWS_REGION}"
echo -e "Cluster: ${ECS_CLUSTER}"
echo -e "Services: ${ECS_SERVICE_FRONTEND}, ${ECS_SERVICE_BACKEND}"
echo -e "${BLUE}=========================================${NC}"
