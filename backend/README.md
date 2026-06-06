# FullPrep Backend API

> **Express + MongoDB REST API** for the FullPrep competitive programming platform.  
> Built by **Member-2 (Shivam)** — Backend Lead.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Environment Variables](#environment-variables)
4. [Running the Server](#running-the-server)
5. [API Reference — Authentication](#api-reference--authentication)
6. [API Reference — Problems](#api-reference--problems)
7. [API Reference — Health](#api-reference--health)
8. [Response Format](#response-format)
9. [Authentication Guide for Frontend](#authentication-guide-for-frontend)
10. [Error Codes Reference](#error-codes-reference)
11. [Architecture Notes](#architecture-notes)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js ≥ 18 |
| Framework | Express 4 (ESM) |
| Database | MongoDB Atlas via Mongoose 8 |
| Auth | JWT (Bearer token + httpOnly cookie) |
| Problem Source | Codnite Problem API on Render |
| Monitoring | Sentry |
| Dev | Nodemon |

---

## Getting Started

```bash
# 1. Go into the backend folder
cd backend

# 2. Install dependencies
npm install

# 3. Copy the example env file and fill in your values
cp .env.example .env

# 4. Start the dev server
npm run dev
```

Server starts at: **http://localhost:5000**

---

## Environment Variables

Create a `.env` file inside `backend/`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fullprep

# JWT
JWT_SECRET=your_64_char_random_secret_here
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# CORS — comma-separated list of allowed frontend origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Codnite Problem API
CODNITE_API_URL=https://codnite-problem-api.onrender.com

# Sentry (optional)
SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
```

> ⚠️ **MongoDB Atlas**: Whitelist your IP in Atlas → Network Access before starting.

---

## Running the Server

```bash
npm run dev    # Development (auto-restart)
npm start      # Production
```

---

## API Reference — Authentication

**Base URL:** `http://localhost:5000/api/auth`

---

### POST `/api/auth/register`
Create a new user account. **Public.**

**Request Body:**
```json
{ "name": "Shivam", "email": "shivam@fullprep.dev", "password": "mypassword123" }
```

**Success `201`:**
```json
{
  "success": true,
  "message": "Account created successfully! Welcome to FullPrep 🎉",
  "token": "<jwt>",
  "user": {
    "_id": "...", "name": "Shivam", "email": "shivam@fullprep.dev",
    "role": "user", "xp": 0, "streak": 0, "level": 1,
    "avatarUrl": "https://ui-avatars.com/api/?name=Shivam&...",
    "createdAt": "2026-06-06T18:00:00.000Z"
  }
}
```

| Error | Reason |
|-------|--------|
| `400` | Missing fields or password < 8 chars |
| `409` | Email already registered |

---

### POST `/api/auth/login`
Login and receive a JWT. **Public.**

**Request Body:**
```json
{ "email": "shivam@fullprep.dev", "password": "mypassword123" }
```

**Success `200`:** Same shape as register (`token` + `user`).

> 💡 Save `token` in localStorage and send as `Authorization: Bearer <token>` on protected requests.

| Error | Reason |
|-------|--------|
| `401` | Wrong email or password |
| `403` | Account deactivated |

---

### POST `/api/auth/logout`
Clears the httpOnly cookie. **Public — no token needed.**

**Success `200`:**
```json
{ "success": true, "message": "Logged out successfully." }
```

> 💡 Also remove the token from localStorage on the frontend.

---

### GET `/api/auth/me`
Get the current user's profile. 🔒 **Requires JWT.**

**Headers:** `Authorization: Bearer <token>`

**Success `200`:**
```json
{
  "success": true,
  "message": "Profile fetched successfully.",
  "data": { "_id": "...", "name": "Shivam", "email": "...", "role": "user", "xp": 150, "streak": 5, "level": 2, ... },
  "user": { ...same object... }
}
```

| Error | Reason |
|-------|--------|
| `401` | Token missing, invalid, or expired |

---

### PATCH `/api/auth/update-profile`
Update name / bio / avatar / socialLinks. 🔒 **Requires JWT.**

**Request Body** (all optional):
```json
{
  "name": "Shivam Kumar",
  "bio": "Backend dev",
  "avatar": "https://example.com/photo.jpg",
  "socialLinks": { "github": "https://github.com/shivam", "linkedin": "", "twitter": "", "website": "" }
}
```

**Success `200`:**
```json
{ "success": true, "message": "Profile updated successfully.", "data": { ...user... }, "user": { ...user... } }
```

---

## API Reference — Problems

**Base URL:** `http://localhost:5000/api/problems`

Problems are fetched from the **Codnite Problem API** (282 Codeforces problems) and cached in MongoDB for 24 hours.

---

### GET `/api/problems`
Paginated, filtered list of problems. **Public.**

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Per page (max 100) |
| `difficulty` | string | — | `EASY` \| `MEDIUM` \| `HARD` \| `HARDER` \| `HARDEST` \| `EXPERT` |
| `tag` | string | — | e.g. `dp`, `math`, `greedy` |
| `source` | string | — | `CODEFORCES` |
| `minRating` | number | — | Min CF rating e.g. `800` |
| `maxRating` | number | — | Max CF rating e.g. `2000` |
| `sortBy` | string | `serialNo` | `serialNo` \| `name` \| `rating` |
| `sortOrder` | string | `asc` | `asc` \| `desc` |
| `search` | string | — | Text search on problem name |

**Example:** `GET /api/problems?difficulty=EASY&tag=math&page=1&limit=10`

**Success `200`:**
```json
{
  "success": true,
  "message": "Problems fetched successfully.",
  "source": "cache",
  "pagination": { "page": 1, "limit": 10, "total": 48, "totalPages": 5, "hasNext": true, "hasPrev": false },
  "data": [
    {
      "_id": "...",
      "externalId": "1579_a__casimir_s_string_solitaire_8c8fe87e",
      "serialNo": 1,
      "name": "1579_A. Casimir's String Solitaire",
      "descriptionPreview": "You are given a string s...",
      "source": "CODEFORCES",
      "difficulty": "EASY",
      "cfRating": 800,
      "cfTags": ["math", "strings"],
      "timeLimitSeconds": 2,
      "memoryLimitMb": 244,
      "stats": { "totalPublicTests": 3, "totalPrivateTests": 50, "totalGeneratedTests": 20, "totalSolutions": 5 },
      "isActive": true,
      "createdAt": "2026-06-06T18:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/problems/:id`
Full problem detail with description and public test cases. **Public.**

`:id` = problem `externalId` (e.g. `1579_a__casimir_s_string_solitaire_8c8fe87e`)

**Success `200`:**
```json
{
  "success": true, "source": "cache",
  "data": {
    "externalId": "...", "name": "...", "description": "Full description...",
    "difficulty": "EASY", "cfRating": 800, "cfTags": ["math"],
    "publicTests": [{ "input": "ABCABC", "output": "YES" }],
    ...
  }
}
```

---

### GET `/api/problems/:id/tests`
Public test cases only. **Public.**

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "problemId": "...",
    "publicTests": [{ "input": "ABCABC", "output": "YES" }, { "input": "ABCA", "output": "NO" }]
  }
}
```

---

### GET `/api/problems/search?q=<query>`
Full-text search by name. **Public.**

**Example:** `GET /api/problems/search?q=sorting&limit=10`

**Success `200`:**
```json
{ "success": true, "data": { "query": "sorting", "totalResults": 8, "results": [...] } }
```

---

### GET `/api/problems/random`
Random problem with optional filters. **Public.**

**Query Params:** `difficulty`, `tag`, `source`

**Example:** `GET /api/problems/random?difficulty=MEDIUM&tag=dp`

---

### GET `/api/problems/tags`
All available tags with problem counts. **Public.**

**Success `200`:**
```json
{
  "success": true,
  "data": { "totalTags": 35, "tags": [{ "name": "math", "count": 45 }, { "name": "dp", "count": 38 }] }
}
```

---

### GET `/api/problems/stats`
Database stats. **Public.**

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "totalProblems": 282,
    "byDifficulty": { "EASY": 85, "MEDIUM": 110, "HARD": 60 },
    "topTags": { "math": 45, "dp": 38 },
    "lastSynced": "2026-06-06T18:00:00.000Z"
  }
}
```

---

### POST `/api/problems/sync` 🔒 Admin Only
Bulk import all problems from Codnite into MongoDB.

**Headers:** `Authorization: Bearer <admin_token>`

**Body (optional):** `{ "forceAll": false }`

> ⏱️ Takes 3–5 minutes for a full sync of all 282 problems.

---

### POST `/api/problems` 🔒 Admin Only
Manually create a custom problem.

### PATCH `/api/problems/:id` 🔒 Admin Only
Update problem fields.

### DELETE `/api/problems/:id` 🔒 Admin Only
Soft-delete (sets `isActive: false`).

---

## API Reference — Health

```
GET /health          → Basic server health check
GET /api/health      → Same via /api prefix
GET /api/ready       → Confirms DB is connected
```

---

## Response Format

Every response uses this envelope:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... },           // On success
  "pagination": { ... },     // On list endpoints
  "token": "...",            // Only on login/register
  "user": { ... }            // Only on auth endpoints (= data)
}
```

---

## Authentication Guide for Frontend

```js
// 1. Login
const res = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
});
const { token, user } = await res.json();
localStorage.setItem('fp_token', token);

// 2. Use token on protected routes
const token = localStorage.getItem('fp_token');
const meRes = await fetch('http://localhost:5000/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: profile } = await meRes.json();

// 3. Logout
await fetch('http://localhost:5000/api/auth/logout', { method: 'POST' });
localStorage.removeItem('fp_token');
```

**Token:** HS256, expires in 7 days, issuer: `fullprep.io`

---

## Error Codes Reference

| Status | Meaning |
|--------|---------|
| `200` | OK |
| `201` | Created |
| `400` | Bad Request — missing/invalid fields |
| `401` | Unauthorized — no/invalid/expired token |
| `403` | Forbidden — valid token but insufficient role |
| `404` | Not Found |
| `409` | Conflict — duplicate email etc. |
| `429` | Too Many Requests — rate limit hit |
| `500` | Internal Server Error |

---

## Architecture Notes

```
backend/
├── server.js                    # Entry point — DB connect + HTTP server
├── instrument.js                # Sentry ESM init (loaded via --import)
├── src/
│   ├── app.js                   # Express app — middleware, routes, error handler
│   ├── config/db.js             # Mongoose connection
│   ├── controllers/
│   │   ├── authController.js    # register, login, logout, getMe, updateProfile
│   │   └── problemController.js # listProblems, getProblem, search, sync, CRUD
│   ├── middleware/
│   │   └── authMiddleware.js    # protect (JWT), restrictTo (RBAC)
│   ├── models/
│   │   ├── User.js              # User schema — bcrypt, toPublicJSON()
│   │   └── Problem.js           # Problem schema — 24h cache, toPublicJSON()
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth/*
│   │   ├── problemRoutes.js     # /api/problems/*
│   │   └── healthRoutes.js      # /api/health, /api/ready
│   └── utils/
│       ├── generateToken.js     # JWT sign + sendTokenResponse
│       └── codniteService.js    # HTTP client for Codnite Problem API
```

### Problem Caching Strategy
1. Request comes in → check MongoDB
2. Cache fresh (< 24h) → return from MongoDB ✅
3. Cache stale / missing → fetch Codnite → save to MongoDB → return
4. Admin can force-refresh all 282 with `POST /api/problems/sync`

### User Roles
| Role | Access |
|------|--------|
| `user` | All public + own auth endpoints |
| `admin` | Everything including problem sync/CRUD |

---

*Built by Shivam — FullPrep Backend Lead (Member-2)*
