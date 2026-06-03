# FullPrep — API Integration Guide

> **Reference**: Frontend-only API integration. How service files, the fetch layer, and page components connect to the Express backend.

---

## Table of Contents

1. [API Architecture Overview](#1-api-architecture-overview)
2. [lib/fetcher.ts — Base Fetch Layer](#2-libfetcherts--base-fetch-layer)
3. [lib/api.ts — HTTP Client](#3-libapitrss--http-client)
4. [lib/error-handler.ts — Error Utilities](#4-liberror-handlerts--error-utilities)
5. [Service Files — Domain API Layer](#5-service-files--domain-api-layer)
6. [Page-to-API Mapping](#6-page-to-api-mapping)
7. [Frontend Environment Variables](#7-frontend-environment-variables)
8. [Auth Flow Integration](#8-auth-flow-integration)
9. [Loading & Error State Patterns](#9-loading--error-state-patterns)
10. [Migrating from Mocks to Real API](#10-migrating-from-mocks-to-real-api)

---

## 1. API Architecture Overview

All API interactions on the frontend follow a strict layered architecture. No page or component ever calls `fetch()` directly.

```
┌─────────────────────────────────────────────────────┐
│                  UI Layer                           │
│  Page component / Custom hook                       │
│  └─ Calls: services/problems.service.ts             │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              Service Layer (services/)              │
│  Domain-scoped API methods                          │
│  └─ Calls: lib/api.ts                               │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│               HTTP Client (lib/api.ts)              │
│  api.get(), api.post(), api.put(), api.delete()     │
│  └─ Calls: lib/fetcher.ts                           │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│            Base Fetcher (lib/fetcher.ts)            │
│  fetch() + AbortController timeout                  │
│  + JSON parsing + ApiError throwing                 │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│           Express Backend API                       │
│  http://localhost:5000/api (dev)                    │
│  https://api.fullprep.dev (prod)                    │
└─────────────────────────────────────────────────────┘
```

### Why this layering?

| Benefit | Description |
|---|---|
| **Testability** | Services can be tested independently from components |
| **Swap-ability** | Replace mock services with real API calls in one file |
| **Error centralization** | All API errors are handled in one place (`error-handler.ts`) |
| **Timeout safety** | AbortController in `fetcher.ts` prevents zombie requests |
| **Type safety** | Full TypeScript generics flow from service to component |

---

## 2. `lib/fetcher.ts` — Base Fetch Layer

The `fetcher` function is the lowest-level HTTP primitive in the frontend.

```ts
export async function fetcher<T>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> {
  const { timeout = 10000, ...customOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...customOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(customOptions.headers || {}),
      },
    });

    clearTimeout(id);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || "Failed to fetch data from API.",
        errorData.errors
      );
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  }
}
```

### Features

| Feature | Implementation |
|---|---|
| **Timeout** | `AbortController` + `setTimeout` (default 10 seconds) |
| **JSON Content-Type** | Auto-set on every request |
| **Header merging** | Custom headers extend the default |
| **Error parsing** | Non-OK responses throw `ApiError` with structured data |
| **Timeout detection** | `AbortError` is caught and re-thrown with friendly message |
| **Generic return** | `Promise<T>` — caller specifies the expected response shape |

### Adding auth headers

When the backend JWT is connected, extend `fetcher` to attach the token:

```ts
const token = getTokenFromCookieOrStore(); // your implementation

const response = await fetch(url, {
  ...customOptions,
  signal: controller.signal,
  headers: {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customOptions.headers || {}),
  },
});
```

---

## 3. `lib/api.ts` — HTTP Client

```ts
export const api = {
  get: <T>(url: string, options?: RequestInit) =>
    fetcher<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, body: any, options?: RequestInit) =>
    fetcher<T>(url, { ...options, method: "POST", body: JSON.stringify(body) }),

  put: <T>(url: string, body: any, options?: RequestInit) =>
    fetcher<T>(url, { ...options, method: "PUT", body: JSON.stringify(body) }),

  delete: <T>(url: string, options?: RequestInit) =>
    fetcher<T>(url, { ...options, method: "DELETE" }),
};
```

### Usage examples

```ts
// GET request — typed response
const problems = await api.get<Problem[]>("/api/problems");

// POST request
const result = await api.post<{ token: string }>("/api/auth/login", {
  email: "khushi@fullprep.dev",
  password: "secret123",
});

// PUT request — update user settings
await api.put<void>("/api/users/settings", { theme: "dark" });

// DELETE request
await api.delete<void>(`/api/bookmarks/${problemId}`);
```

### Base URL construction

Services should prepend the environment variable:

```ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL; // "http://localhost:5000/api"

const problems = await api.get<Problem[]>(`${BASE_URL}/problems`);
```

---

## 4. `lib/error-handler.ts` — Error Utilities

### `ApiError` class

```ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]> // Field-level validation errors
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

Example: A 422 validation error from the server:
```json
{
  "statusCode": 422,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is already taken"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### `handleApiError(error)` function

```ts
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.statusCode === 401) return "Session expired. Please log in again.";
    if (error.statusCode === 422 && error.errors) {
      return Object.values(error.errors).flat().join(", ");
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected network error occurred.";
}
```

### Usage in components

```tsx
const [error, setError] = useState<string | null>(null);

try {
  const data = await ProblemsService.getProblems();
  setProblems(data);
} catch (err) {
  setError(handleApiError(err)); // "Session expired." or "Network error." etc.
}
```

---

## 5. Service Files — Domain API Layer

Each service file encapsulates all API calls for a specific domain. Currently, services return **mock data** — they are designed to be easily swapped for real API calls.

---

### `services/auth.service.ts`

```ts
export const AuthService = {
  async getCurrentUser() {
    // Real: return api.get<User>(`${BASE_URL}/auth/me`);
    return { id: "1", email: "khushi@fullprep.dev", fullName: "Khushi", username: "khushi.dev", role: "Pro Coder" };
  },
};
```

**Planned endpoints**:
- `POST /api/auth/login` — Email + password login
- `POST /api/auth/signup` — User registration
- `POST /api/auth/logout` — Session invalidation
- `GET /api/auth/me` — Get current user profile
- `POST /api/auth/forgot-password` — Trigger reset email
- `POST /api/auth/reset-password` — Submit new password

---

### `services/problems.service.ts`

```ts
export const ProblemsService = {
  async getProblems(): Promise<ExtendedProblemItem[]> {
    return PROBLEMS_LIST_MOCK;
    // Real: return api.get<ExtendedProblemItem[]>(`${BASE_URL}/problems`);
  },

  async getProblemBySlug(slug: string): Promise<ExtendedProblemItem | undefined> {
    return PROBLEMS_LIST_MOCK.find((p) => toSlug(p.title) === slug);
    // Real: return api.get<ExtendedProblemItem>(`${BASE_URL}/problems/${slug}`);
  },
};
```

**Planned endpoints**:
- `GET /api/problems` — List with filters (difficulty, topic, status)
- `GET /api/problems/:slug` — Get single problem
- `POST /api/problems/:id/submit` — Submit solution

---

### `services/submissions.service.ts`

**Planned endpoints**:
- `GET /api/submissions` — User submission history
- `GET /api/submissions/:id` — Single submission detail

---

### `services/contests.service.ts`

**Planned endpoints**:
- `GET /api/contests` — List upcoming and past contests
- `POST /api/contests/:id/register` — Register for contest

---

### `services/leaderboard.service.ts`

**Planned endpoints**:
- `GET /api/leaderboard` — Global ranking with pagination
- `GET /api/leaderboard?period=weekly` — Filtered by time period

---

### `services/profile.service.ts`

**Planned endpoints**:
- `GET /api/users/:username` — Public profile
- `PUT /api/users/profile` — Update profile
- `PUT /api/users/settings` — Update settings

---

### `services/bookmarks.service.ts`

**Planned endpoints**:
- `GET /api/bookmarks` — User's bookmarked problems
- `POST /api/bookmarks/:problemId` — Add bookmark
- `DELETE /api/bookmarks/:problemId` — Remove bookmark

---

### `services/notifications.service.ts`

**Planned endpoints**:
- `GET /api/notifications` — Notification list
- `PUT /api/notifications/:id/read` — Mark as read
- `PUT /api/notifications/read-all` — Mark all as read

---

## 6. Page-to-API Mapping

| Page | Service Used | API Endpoints |
|---|---|---|
| `/` | `AuthService` | `GET /api/auth/me` |
| `/login` | `AuthService` | `POST /api/auth/login` |
| `/signup` | `AuthService` | `POST /api/auth/signup` |
| `/forgot-password` | `AuthService` | `POST /api/auth/forgot-password` |
| `/reset-password` | `AuthService` | `POST /api/auth/reset-password` |
| `/problems` | `ProblemsService` | `GET /api/problems` |
| `/problems/[slug]` | `ProblemsService` | `GET /api/problems/:slug`, `POST /api/problems/:id/submit` |
| `/profile` | `AuthService`, `ProfileService` | `GET /api/auth/me`, `GET /api/users/:username` |
| `/settings` | `ProfileService` | `PUT /api/users/settings` |
| `/leaderboard` | `LeaderboardService` | `GET /api/leaderboard` |
| `/contests` | `ContestsService` | `GET /api/contests` |
| `/submissions` | `SubmissionsService` | `GET /api/submissions` |
| `/bookmarks` | `BookmarksService` | `GET /api/bookmarks` |
| `/notifications` | `NotificationsService` | `GET /api/notifications` |
| `/ai-hints` | *(future AI service)* | `POST /api/ai/hint` |

---

## 7. Frontend Environment Variables

Create a `.env.local` file at the project root:

```env
# Backend API base URL (no trailing slash)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# App environment
NEXT_PUBLIC_APP_ENV=development

# (Future) AI service key
NEXT_PUBLIC_AI_API_KEY=your-ai-service-key
```

### Accessing in code

```ts
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// → "http://localhost:5000/api" (dev)
// → "https://api.fullprep.dev/api" (prod, from Vercel env vars)
```

> **Security note**: `NEXT_PUBLIC_` prefix exposes the variable to the browser. Never put secrets (JWT signing keys, DB passwords) in `NEXT_PUBLIC_` variables. Only API base URLs and public keys belong here.

### Environment files

| File | When used |
|---|---|
| `.env.local` | Local development (gitignored) |
| `.env.development` | Loaded in `next dev` |
| `.env.production` | Loaded in `next build` / `next start` |
| `.env.example` | Template committed to git (no real values) |

---

## 8. Auth Flow Integration

### Current State (Mock)

```ts
// authStore.ts — pre-authenticated mock user
const useAuthStore = create<AuthState>((set) => ({
  user: { name: "Khushi", email: "khushi.dev" },
  isAuthenticated: true,
  // ...
}));
```

### Target State (Real JWT Flow)

```
User submits login form
    ↓
AuthService.login({ email, password })
    ↓
api.post<{ token: string; user: UserProfile }>("/api/auth/login", { email, password })
    ↓
Response: { token: "eyJ...", user: { name, email, ... } }
    ↓
Store token: document.cookie = `session-token=${token}; path=/; secure; httpOnly`
         or: localStorage.setItem("auth-token", token)
    ↓
authStore.login({ user }) — update Zustand state
    ↓
router.push("/") — redirect to dashboard
    ↓
middleware.ts reads cookie on next request → grants access to protected routes
```

### Token refresh pattern (future)

```ts
// In fetcher.ts — intercept 401 and attempt token refresh
if (response.status === 401) {
  const refreshed = await tryRefreshToken();
  if (refreshed) {
    return fetch(url, { ...options, headers: { Authorization: `Bearer ${newToken}` } });
  } else {
    authStore.logout();
    router.push("/login");
  }
}
```

---

## 9. Loading & Error State Patterns

### Pattern 1: Component-level loading state

```tsx
const [problems, setProblems] = useState<Problem[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  ProblemsService.getProblems()
    .then(setProblems)
    .catch((err) => setError(handleApiError(err)))
    .finally(() => setLoading(false));
}, []);

if (loading) return <Skeleton />;
if (error) return <ErrorMessage message={error} />;
return <ProblemList problems={problems} />;
```

### Pattern 2: Toast notification for mutations

```tsx
const showToast = useNotificationStore((s) => s.showToast);

const handleBookmark = async (problemId: string) => {
  try {
    await BookmarksService.addBookmark(problemId);
    showToast("Problem bookmarked!", "success");
  } catch (err) {
    showToast(handleApiError(err), "info");
  }
};
```

### Pattern 3: Next.js loading.tsx (automatic Suspense)

Every route directory can have a `loading.tsx` that renders while the page loads:

```tsx
// app/(dashboard)/problems/loading.tsx
export default function ProblemsLoading() {
  return (
    <div className="space-y-4">
      {Array(8).fill(null).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  );
}
```

This triggers automatically when navigating to `/problems`.

### Pattern 4: Error boundaries

```tsx
// app/error.tsx — catches render errors in the route subtree
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 10. Migrating from Mocks to Real API

### Step-by-step for any service file

**Before (mock)**:

```ts
// services/problems.service.ts
import { PROBLEMS_LIST_MOCK } from "@/mocks/problems.mock";

export const ProblemsService = {
  async getProblems() {
    return PROBLEMS_LIST_MOCK; // ← mock
  },
};
```

**After (real API)**:

```ts
// services/problems.service.ts
import { api } from "@/lib/api";
import { Problem } from "@/types/problems";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ProblemsService = {
  async getProblems(): Promise<Problem[]> {
    return api.get<Problem[]>(`${BASE}/problems`);
  },

  async getProblemBySlug(slug: string): Promise<Problem> {
    return api.get<Problem>(`${BASE}/problems/${slug}`);
  },
};
```

**Zero changes needed in**:
- Page components
- Hooks
- Zustand stores
- Tests

The service layer is the only file that changes.

### Migration checklist

- [ ] Define TypeScript types in `types/` matching the backend response shapes
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- [ ] Replace mock return values with `api.get<T>()` / `api.post<T>()` calls
- [ ] Handle loading and error states in the component (if not already done)
- [ ] Test error cases (401, 422, 500) to verify `handleApiError` works correctly
- [ ] Activate middleware route protection in `middleware.ts`
