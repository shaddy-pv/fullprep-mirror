# FullPrep Platform

An industry-level competitive programming platform featuring a modern Next.js 16 frontend, an Express/MongoDB backend, and automated problem caching/seeding.

---

## 🚀 Key Features

* **Interactive Code Workspace**: Monaco editor integration with language support (C++, Java, Python, JavaScript).
* **Live Database Cache**: Seeding from Codnite API stores 282 Codeforces problems locally in MongoDB.
* **Authentication**: Robust token-based user sign-up/login with persistent local sessions and JWT verification.
* **Dashboard & Analytics**: Dynamic statistics tracking level, experience points (XP), problem solving streaks, and performance analytics.

---

## 📁 Repository Structure

* [frontend/](file:///C:/Users/khush/.gemini/antigravity/scratch/fullprep/frontend): Next.js App Router (TailwindCSS, Zustand, Monaco Editor)
* [backend/](file:///C:/Users/khush/.gemini/antigravity/scratch/fullprep/backend): Express REST API (MongoDB Atlas/Mongoose, Firebase Auth Sync, JWT)
* [devops/](file:///C:/Users/khush/.gemini/antigravity/scratch/fullprep/devops): Dockerization and deployment config

---

## 🛠️ Local Development Quickstart

Follow these steps to get the frontend and backend connected and running locally.

### Prerequisites
* **Node.js** (v18 or higher)
* **MongoDB** (Running locally on `mongodb://localhost:27017` or via MongoDB Atlas connection)

---

### Step 1: Set up and Seed Backend

1. Navigate to the backend directory and install packages:
   ```bash
   cd backend
   npm install
   ```

2. Copy the example environment variables and configure your settings:
   ```bash
   cp .env.example .env
   ```
   *Note: For local development, set `MONGO_URI=mongodb://localhost:27017/fullprep`.*

3. Seed the local MongoDB database with problems:
   ```bash
   npm run seed
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The API will now be listening on [http://localhost:5000](http://localhost:5000).

---

### Step 2: Set up and Start Frontend

1. Open a new terminal session, navigate to the frontend directory, and install packages:
   ```bash
   cd frontend
   npm install
   ```

2. Copy the example environment variables and configure your settings:
   ```bash
   cp .env.local.example .env.local
   ```

3. Launch the Next.js development server:
   ```bash
   npm run dev
   ```
   The web application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 📦 Deployment & Docker

Refer to the [devops/](file:///C:/Users/khush/.gemini/antigravity/scratch/fullprep/devops) directory and `docker-compose.yml` configuration at the root of the project to orchestrate the services in containerized environments.
