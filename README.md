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
  <p><strong>An industry-level competitive programming platform featuring a modern Next.js frontend, an Express/MongoDB backend, and a dedicated Admin Dashboard.</strong></p>
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
* **Admin Dashboard**: Full CRUD panel to manage problems, view user statistics, and monitor system health.
* **Live Database Cache & Seeding**: Automated problem seeding from external APIs (Codnite) mapping directly to MongoDB.
* **Authentication & Security**: Robust JWT-based authentication with persistent local sessions, data export, and account deletion functionality.
* **Advanced Analytics**: Dynamic statistics tracking including Level, Experience Points (XP), current/longest problem-solving streaks, and performance charts.

---

## 📁 Repository Structure

This project is organized as a monorepo containing four main services:

* `frontend/` - **Main Web Application**: Built with Next.js App Router, TailwindCSS, Zustand, and Monaco Editor.
* `backend/` - **REST API Server**: Built with Express.js, MongoDB Atlas/Mongoose, and Google Gemini AI integrations.
* `fullprep-Admin/` - **Admin Dashboard**: Built as a React Single Page Application (SPA) for problem and user management.
* `landing-page/` - **Marketing Site**: A lightweight Next.js application for the platform's public-facing landing page.
* `devops/` - **Infrastructure**: Dockerization and deployment configuration files.

---

## 🛠️ Local Development Quickstart

Follow these steps to run the FullPrep platform locally.

### Prerequisites
* **Node.js** (v18 or higher)
* **MongoDB** (Running locally on `mongodb://localhost:27017` or via MongoDB Atlas connection)
* **Gemini API Key** (Required for the AI Tutor features)

### Step 1: Start the Backend API

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure your environment variables:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to include your `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.*

3. Seed the local MongoDB database with problems (Optional):
   ```bash
   npm run seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   *The API will run on `http://localhost:5000`.*

### Step 2: Start the Main Frontend Platform

1. Open a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   *Ensure `NEXT_PUBLIC_API_URL` points to `http://localhost:5000/api`.*

3. Launch the Next.js development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:3000`.*

### Step 3: Start the Admin Panel (Optional)

1. Open a new terminal, navigate to the admin directory:
   ```bash
   cd fullprep-Admin
   npm install
   ```

2. Configure environment variables:
   Create a `.env` file and set `VITE_API_URL=http://localhost:5000/api`

3. Launch the Admin development server:
   ```bash
   npm run dev
   ```
   *The Admin Panel will be accessible at `http://localhost:5173`.*

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

The platform supports Docker out-of-the-box. Refer to the `devops/` directory and the `docker-compose.yml` configuration at the root of the project to orchestrate the services in containerized environments.

```bash
# Spin up the entire platform via Docker
docker-compose up --build -d
```
