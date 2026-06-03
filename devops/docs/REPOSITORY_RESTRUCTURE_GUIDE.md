# Repository Restructure Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Before vs After](#before-vs-after)
3. [File Distribution](#file-distribution)
4. [Benefits](#benefits)
5. [How to Use](#how-to-use)
6. [Git Workflow](#git-workflow)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The FullPrep project was restructured from a **monorepo** into **3 independent repositories** on June 3, 2026. This change improves team collaboration, enables independent deployments, and provides better code organization.

### Three Repositories

| Repository | Purpose | Tech Stack | Status |
|-----------|---------|------------|--------|
| **fullprep-frontend** | Web UI/UX | Next.js, TypeScript, TailwindCSS | 85% ✅ |
| **fullprep-backend** | REST API | Node.js, Express, MongoDB | 20% ⚠️ |
| **fullprep-devops** | Infrastructure | Docker, GitHub Actions, AWS | 100% ✅ |

---

## Before vs After

### Before: Monorepo Structure
```
fullprep-main/ (Single Repository)
├── app/                      # Frontend pages
├── components/               # Frontend components  
├── lib/                      # Frontend utilities
├── services/                 # Frontend services
├── backend/                  # Backend code
│   └── src/
│       ├── controllers/
│       ├── models/
│       └── routes/
├── .github/workflows/        # CI/CD
├── aws/                      # Infrastructure
├── kubernetes/               # K8s configs
├── scripts/                  # Automation
└── [Documentation mixed]
```

**Problems:**
- ❌ Frontend and backend tightly coupled
- ❌ Large repository (slow git operations)
- ❌ Changes to frontend trigger backend CI/CD
- ❌ Difficult to manage permissions
- ❌ Unclear ownership
- ❌ Mixed documentation

### After: Multi-Repo Structure
```
fullprep-frontend/ (Independent Repository)
├── app/
├── components/
├── lib/
├── services/
├── hooks/
├── store/
├── types/
├── mocks/
├── docs/
└── README.md

fullprep-backend/ (Independent Repository)
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
├── docs/
├── server.js
└── README.md

fullprep-devops/ (Independent Repository)
├── .github/workflows/
├── aws/
├── kubernetes/
├── scripts/
├── docs/
├── docker-compose.yml
├── Dockerfile.frontend
└── README.md
```

**Benefits:**
- ✅ Clear separation of concerns
- ✅ Independent deployments
- ✅ Faster CI/CD (only build what changed)
- ✅ Better access control
- ✅ Focused documentation
- ✅ Easier onboarding

---

## File Distribution

### Frontend Repository Files

**Directories (14):**
```
✅ app/           - Next.js pages (29 files)
✅ components/    - React components (46 files)
✅ constants/     - Constants (4 files)
✅ hooks/         - Custom hooks (5 files)
✅ lib/           - Utilities (4 files)
✅ mocks/         - Mock data (3 files)
✅ providers/     - Context providers (3 files)
✅ public/        - Static assets (5 files)
✅ schemas/       - Validation schemas (4 files)
✅ services/      - API services (8 files)
✅ store/         - Zustand stores (7 files)
✅ types/         - TypeScript types (4 files)
✅ docs/          - Documentation (6 files)
✅ .git/          - Git repository
```

**Config Files (11):**
```
✅ package.json
✅ package-lock.json
✅ next.config.ts
✅ next.config.js
✅ tsconfig.json
✅ postcss.config.mjs
✅ eslint.config.mjs
✅ .gitignore
✅ middleware.ts
✅ next-env.d.ts
✅ README.md
```

**Total:** ~126 files (excluding node_modules)

---

### Backend Repository Files

**Directories (5):**
```
✅ src/
   ├── config/      - Configuration (1 file)
   ├── controllers/ - Request handlers (1 file)
   ├── middleware/  - Middleware (1 file)
   ├── models/      - Database models (1 file)
   ├── routes/      - API routes (2 files)
   └── utils/       - Utilities (1 file)
✅ docs/            - Documentation (to be added)
✅ node_modules/    - Dependencies (2,315 files)
✅ .git/            - Git repository
```

**Config Files (9):**
```
✅ package.json
✅ package-lock.json
✅ server.js
✅ .env
✅ .env.example
✅ .dockerignore
✅ Dockerfile
✅ .gitignore
✅ README.md
```

**Total:** ~2,330 files (with node_modules)

---

### DevOps Repository Files

**Directories (6):**
```
✅ .github/workflows/ - CI/CD pipelines (2 files)
✅ aws/              - AWS infrastructure (3 files)
   ├── ecs-task-definition.json
   └── terraform/
       ├── main.tf
       └── variables.tf
✅ kubernetes/       - K8s manifests (1 file)
✅ scripts/          - Automation scripts (4 files)
✅ docs/             - Documentation (14 files)
✅ .git/             - Git repository
```

**Config Files (6):**
```
✅ Dockerfile.frontend
✅ docker-compose.yml
✅ .env.docker
✅ .dockerignore
✅ .gitignore
✅ README.md
```

**Total:** ~30 files

---

## Benefits

### 1. Independent Development
Each team can work without interfering with others:
- **Frontend team** can update UI without triggering backend builds
- **Backend team** can refactor APIs without affecting frontend
- **DevOps team** can update infrastructure independently

### 2. Faster CI/CD
```
Before (Monorepo):
- Change 1 line in frontend → Full build (frontend + backend)
- Time: ~15 minutes
- Cost: High (2x compute)

After (Multi-Repo):
- Change 1 line in frontend → Only frontend builds
- Time: ~5 minutes
- Cost: Low (1x compute)
```

### 3. Better Security
- Separate repository permissions
- Frontend developers don't need backend access
- Backend developers don't need infrastructure access
- DevOps team has full infrastructure control

### 4. Improved Scaling
```
Before: Monorepo grows → Git operations slow down
After:  Each repo stays small → Fast git operations
```

### 5. Clear Ownership
```
Frontend bugs    → Frontend repository issues
Backend bugs     → Backend repository issues
Deployment bugs  → DevOps repository issues
```

---

## How to Use

### Full Stack Development

#### Option 1: Docker Compose (Recommended)
```bash
cd fullprep-devops
docker-compose up -d

# Access services:
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# MongoDB:  mongodb://localhost:27017
```

#### Option 2: Manual Startup
```bash
# Terminal 1 - Backend
cd fullprep-backend
npm install
npm run dev  # Port 5000

# Terminal 2 - Frontend
cd fullprep-frontend
npm install
npm run dev  # Port 3000
```

### Working on Individual Repositories

**Frontend Only:**
```bash
cd fullprep-frontend
npm install
npm run dev
# Make changes, commit, push
git add .
git commit -m "feat: add new feature"
git push origin main
```

**Backend Only:**
```bash
cd fullprep-backend
npm install
npm run dev
# Make changes, commit, push
git add .
git commit -m "fix: resolve API bug"
git push origin main
```

**DevOps Only:**
```bash
cd fullprep-devops
# Update CI/CD, Docker configs, etc.
git add .
git commit -m "ci: update deployment pipeline"
git push origin main
```

---

## Git Workflow

### Repository Setup

Each repository has its own Git history:

```bash
# Check current repository
cd fullprep-frontend
git remote -v
# Should show: fullprep-frontend remote

cd ../fullprep-backend
git remote -v
# Should show: fullprep-backend remote

cd ../fullprep-devops
git remote -v
# Should show: fullprep-devops remote
```

### Pushing to GitHub

**Step 1: Create GitHub repositories**
```bash
# On GitHub, create:
# 1. fullprep-frontend
# 2. fullprep-backend
# 3. fullprep-devops
```

**Step 2: Add remotes**
```bash
cd fullprep-frontend
git remote add origin https://github.com/YOUR-ORG/fullprep-frontend.git
git branch -M main
git push -u origin main

cd ../fullprep-backend
git remote add origin https://github.com/YOUR-ORG/fullprep-backend.git
git branch -M main
git push -u origin main

cd ../fullprep-devops
git remote add origin https://github.com/YOUR-ORG/fullprep-devops.git
git branch -M main
git push -u origin main
```

### Branch Strategy (Per Repository)

```
main              # Production-ready
├── develop       # Integration branch
├── feature/*     # New features
├── bugfix/*      # Bug fixes
└── hotfix/*      # Emergency fixes
```

### Commit Messages

Follow conventional commits:
```bash
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
ci: Update CI/CD
```

---

## Troubleshooting

### Issue: Frontend can't connect to backend

**Solution:**
```bash
# Check backend is running
cd fullprep-backend
npm run dev

# Check frontend API URL
cd fullprep-frontend
# In .env.local:
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Issue: Docker containers not starting

**Solution:**
```bash
cd fullprep-devops
# Check logs
docker-compose logs -f

# Rebuild containers
docker-compose down
docker-compose up --build -d
```

### Issue: MongoDB connection failed

**Solution:**
```bash
cd fullprep-backend
# Check .env file
cat .env | grep MONGODB_URI

# Verify MongoDB is running
docker-compose ps mongo
```

### Issue: Git push failed

**Solution:**
```bash
# Check remote is set
git remote -v

# If empty, add remote:
git remote add origin https://github.com/YOUR-ORG/REPO-NAME.git

# Try push again
git push -u origin main
```

### Issue: CI/CD pipeline failing

**Solution:**
1. Check GitHub Actions logs
2. Verify secrets are configured
3. Check workflow file syntax
4. Ensure all dependencies are installed

---

## Migration Checklist

### Completed ✅
- [x] Create 3 repository directories
- [x] Initialize Git in each repository
- [x] Copy files to respective repositories
- [x] Create README for each repository
- [x] Organize documentation by repository
- [x] Create .gitignore files
- [x] Create restructure documentation

### To Do 📋
- [ ] Push repositories to GitHub
- [ ] Setup branch protection rules
- [ ] Configure GitHub Actions secrets
- [ ] Update CI/CD for multi-repo
- [ ] Test full deployment workflow
- [ ] Document inter-repo communication
- [ ] Setup repository wikis
- [ ] Train team on new structure

---

## Quick Reference

### Repository URLs (After GitHub Push)
```
Frontend: https://github.com/YOUR-ORG/fullprep-frontend
Backend:  https://github.com/YOUR-ORG/fullprep-backend
DevOps:   https://github.com/YOUR-ORG/fullprep-devops
```

### Local Paths
```
Frontend: E:\Project\Working\fullprep-main\fullprep-frontend
Backend:  E:\Project\Working\fullprep-main\fullprep-backend
DevOps:   E:\Project\Working\fullprep-main\fullprep-devops
```

### Service Ports
```
Frontend: 3000
Backend:  5000
MongoDB:  27017
Redis:    6379 (to be added)
```

---

## Additional Resources

- [Repository Structure](../../REPOSITORY_STRUCTURE.md) - Complete overview
- [Restructure Summary](../../RESTRUCTURE_SUMMARY.md) - What was done
- [Status Report](./REPOSITORY_STATUS_REPORT.md) - Project analysis
- [Execution Plan](./FullPrep_Execution_Plan.md) - Development roadmap

---

**Restructure Date:** June 3, 2026  
**Performed By:** Member 3 (Shadan) - DevOps Lead  
**Status:** ✅ Complete
