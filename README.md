<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</div>

<br />

<div align="center">
  <h1>🚀 FullPrep Platform</h1>
  <p><strong>An industry-level competitive programming platform featuring a modern Next.js frontend, an Express/MongoDB backend, a dedicated Admin Dashboard, and a public marketing landing page.</strong></p>
</div>

---

## 🔗 Live Links

* **Landing Page**: [https://fullprep.vercel.app](https://fullprep.vercel.app)
* **Main App (Platform)**: [https://fullprep-home.vercel.app](https://fullprep-home.vercel.app)
* **Admin Panel**: [https://fullprep-admin.vercel.app](https://fullprep-admin.vercel.app)
* **Backend API Server**: [https://fullprep-frontend-mirror.onrender.com/health](https://fullprep-frontend-mirror.onrender.com/health)

---

## ✨ Key Features

* **Interactive Code Workspace**: Monaco editor integration with execution support for C++, Java, Python, and JavaScript.
* **AI Tutor (Gemini 2.5 Flash)**: Context-aware AI hints based on user code to unblock stuck users with integrated free/pro limits.
* **Contest Calendar**: Live contest scheduler where admins create contests (with platform, registration URL, start/end time) from the Admin Dashboard, and users see them automatically on the Contest Calendar page with Live/Upcoming/Completed status tabs.
* **Admin Dashboard**: Full CRUD panel to manage problems, contests, users, submissions, view system analytics, and monitor platform health.
* **Live Database Cache & Seeding**: Automated problem seeding from external APIs (Codnite) mapping directly to MongoDB.
* **Authentication & Security**: Robust JWT-based authentication with persistent local sessions, data export, and account deletion functionality.
* **Advanced Analytics**: Dynamic statistics tracking including Level, Experience Points (XP), current/longest problem-solving streaks, and performance charts.
* **Leaderboard & Social**: Global leaderboard with platform filter, country filter, time period selector, and friend system.

---

## 📁 Repository Structure

This project is organized as a monorepo containing four main services:

```
fullprep-mirror/
├── backend/              # Express.js REST API (MVC, Mongoose, Gemini AI, BullMQ)
├── frontend/             # Main Web App (Next.js App Router, Tailwind, Zustand, Monaco)
├── fullprep-Admin/       # Admin Dashboard (React + Vite SPA, TanStack Router & Query)
├── landing-page/         # Marketing Site (Next.js, lightweight)
└── devops/               # Docker & CI/CD infrastructure
```

### Key Directories

| Path | Purpose |
|------|---------|
| `backend/src/controllers/` | Route controllers (auth, stats, problems, contests, AI, etc.) |
| `backend/src/models/` | Mongoose schemas (User, Problem, Contest, Submission, …) |
| `backend/src/routes/` | Express route definitions |
| `frontend/app/(dashboard)/` | All authenticated dashboard pages |
| `frontend/app/(dashboard)/contests/` | Contest Calendar page |
| `frontend/services/` | API service wrappers (DIP-compliant) |
| `frontend/store/` | Zustand state stores |
| `fullprep-Admin/src/routes/` | Admin page routes (TanStack File-Based Routing) |
| `fullprep-Admin/src/lib/api.ts` | Admin API client (all backend calls) |

---

## 🛠️ Local Development Quickstart

### Prerequisites
* **Node.js** v18 or higher
* **MongoDB** running locally on `mongodb://localhost:27017` or via MongoDB Atlas
* **Gemini API Key** — required for AI Tutor features

### Step 1: Start the Backend API

```bash
cd backend
npm install
cp .env.example .env        # Fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm run seed                 # (Optional) Seed problems from Codnite
npm run dev                  # → http://localhost:5000
```

### Step 2: Start the Main Frontend Platform

```bash
cd frontend
npm install
cp .env.local.example .env.local   # Set NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
npm run dev                         # → http://localhost:3000
```

### Step 3: Start the Admin Panel

```bash
cd fullprep-Admin
npm install
# Create .env with: VITE_API_BASE_URL=http://localhost:5000/api
npm run dev                         # → http://localhost:5173
```

### Step 4: (Optional) Start the Landing Page

```bash
cd landing-page
npm install
npm run dev                         # → http://localhost:3001
```

---

## 🗄️ Contest Calendar — Admin Integration

The Contest Calendar is fully integrated between the Admin Dashboard and the user-facing platform:

1. **Admin creates a contest** at `/contests/create` — sets title, description, platform (Codeforces, LeetCode, AtCoder, HackerRank, CodeChef, Codnite, etc.), registration URL, start/end time, problems, and publish status.
2. **Backend stores** the contest in MongoDB via `POST /api/contests` (admin-only).
3. **Frontend fetches** all active contests via `GET /api/contests?all=true` and displays them on the Contest Calendar page.
4. Contests are automatically tagged **Live**, **Upcoming**, or **Completed** based on the current time.
5. Admin can **Edit** or **Delete** contests from `/contests/:id` — changes reflect instantly on the user-facing page.
6. **Published/Draft toggle** allows admins to soft-hide a contest without deleting it.

---

## 📸 Screenshots

| Dashboard & Overview |
|:---:|
| ![Dashboard](photos/Screenshot%202026-06-16%20000247.png) |
| ![Profile](photos/Screenshot%202026-06-16%20000643.png) |
| ![Coding Workspace](photos/Screenshot%202026-06-16%20000704.png) |
| ![Leaderboard](photos/Screenshot%202026-06-16%20000715.png) |
| ![Submissions](photos/Screenshot%202026-06-16%20000737.png) |

---

## 📦 Deployment & Containerization

The platform supports Docker out-of-the-box. Refer to the `devops/` directory and the `docker-compose.yml` at the project root to orchestrate all services together.

```bash
# Spin up the entire platform via Docker
docker-compose up --build -d
```

---

## 🧪 Testing

```bash
# Frontend type check
cd frontend && npm run type-check

# Frontend lint
cd frontend && npm run lint

# Backend unit tests
cd backend && npm test

# Full E2E Playwright suite (requires both servers running)
cd frontend && npm run test:e2e
```

---

## 🤝 Contributing

1. Create a feature branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes and ensure all tests pass
3. Open a PR — GitHub Actions will automatically run lint, type-check, unit tests, build, and E2E validation
4. Merge after all checks are green ✅
