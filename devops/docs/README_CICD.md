# 🚀 Quick Start Guide - CI/CD Setup

**For:** Member-3 Shadan - DevOps Engineer  
**Project:** FullPrep Platform

---

## 📦 What's Included

This CI/CD implementation includes:

✅ **Docker Setup**
- Frontend Dockerfile (Next.js)
- Backend Dockerfile (Express)
- Docker Compose with MongoDB
- Multi-stage optimized builds

✅ **GitHub Actions CI/CD**
- Automated testing & linting
- Security scanning (Trivy)
- Docker image builds
- AWS ECS deployment
- Slack notifications

✅ **AWS Infrastructure**
- ECS Task Definitions
- Terraform templates
- Deployment scripts

✅ **Kubernetes Support**
- Deployment manifests
- Service definitions
- Auto-scaling configs

---

## 🏃 Quick Start

### 1. Test Locally

```bash
# Build Docker images
./scripts/docker-build.sh

# Start all services
./scripts/docker-run.sh

# Access:
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

### 2. Setup GitHub Actions

Add these secrets in GitHub repo settings:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `SLACK_WEBHOOK` (optional)

### 3. Deploy to AWS

```bash
# Set environment variables
export AWS_REGION=us-east-1
export ECS_CLUSTER=fullprep-cluster

# Deploy
./scripts/deploy-aws.sh
```

---

## 📂 File Structure


```
fullprep/
├── .github/
│   └── workflows/
│       ├── ci-cd.yml              # Main CI/CD pipeline
│       └── docker-build.yml       # Docker build workflow
├── aws/
│   ├── ecs-task-definition.json   # ECS task config
│   └── terraform/                 # Infrastructure as Code
│       ├── main.tf
│       └── variables.tf
├── kubernetes/
│   └── deployment.yaml            # K8s manifests
├── scripts/
│   ├── docker-build.sh            # Build Docker images
│   ├── docker-run.sh              # Start services
│   ├── docker-clean.sh            # Cleanup
│   └── deploy-aws.sh              # AWS deployment
├── backend/
│   ├── Dockerfile                 # Backend container
│   ├── .dockerignore
│   └── src/
│       └── routes/
│           └── healthRoutes.js    # Health checks
├── Dockerfile                     # Frontend container
├── .dockerignore
├── docker-compose.yml             # Local orchestration
├── .env.docker                    # Docker env template
├── next.config.js                 # Next.js config
└── CICD_IMPLEMENTATION.md         # Full documentation
```

---

## 🔑 Key Commands

### Docker Commands
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up everything
./scripts/docker-clean.sh
```

### AWS Commands
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Update ECS service
aws ecs update-service \
    --cluster fullprep-cluster \
    --service fullprep-backend \
    --force-new-deployment
```

### Kubernetes Commands
```bash
# Apply manifests
kubectl apply -f kubernetes/deployment.yaml

# Check status
kubectl get all -n fullprep

# View logs
kubectl logs -f deployment/fullprep-backend -n fullprep
```

---

## 🏥 Health Checks

### Endpoints
- Backend Health: `http://localhost:5000/api/health`
- Backend Ready: `http://localhost:5000/api/ready`
- Frontend: `http://localhost:3000`

### Test Health
```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:3000
```

---

## 📊 Monitoring

### Docker Stats
```bash
docker stats
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Check Health Status
```bash
docker ps
```

---

## 🐛 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Inspect container
docker inspect fullprep-backend

# Check health
docker ps -a
```

### Build Fails
```bash
# Clean and rebuild
docker system prune -a
docker-compose build --no-cache
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
docker-compose ps mongodb

# View MongoDB logs
docker-compose logs mongodb

# Test connection
docker exec fullprep-backend nc -zv mongodb 27017
```

---

## 📚 Documentation

**Full Details:** See `CICD_IMPLEMENTATION.md` for:
- Complete architecture diagrams
- Detailed explanations
- AWS setup guide
- Security best practices
- Performance optimization
- Troubleshooting guide

---

## ✅ Checklist

### Before First Deployment

- [ ] Docker Desktop installed
- [ ] AWS CLI installed and configured
- [ ] GitHub secrets configured
- [ ] `.env` file created from `.env.docker`
- [ ] Tested locally with Docker Compose
- [ ] ECR repositories created
- [ ] ECS cluster created
- [ ] Load balancer configured

### After Deployment

- [ ] Health checks passing
- [ ] Application accessible
- [ ] Logs monitored
- [ ] CloudWatch alarms set
- [ ] Auto-scaling configured
- [ ] Team notified

---

## 🆘 Support

For detailed help, see:
- `CICD_IMPLEMENTATION.md` - Full documentation
- `docker-compose.yml` - Service configuration
- `.github/workflows/` - CI/CD pipeline details

---

**Status:** ✅ Production Ready  
**Implemented By:** Shadan  
**Date:** June 3, 2026
