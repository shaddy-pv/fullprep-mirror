# FullPrep — Routing System

> **Reference**: App Router routing hierarchy, layout nesting, navigation flows, and dynamic routes.

---

## Table of Contents

1. [Routing Philosophy](#1-routing-philosophy)
2. [Complete Route Map](#2-complete-route-map)
3. [Route Groups Explained](#3-route-groups-explained)
4. [Layout Nesting Diagram](#4-layout-nesting-diagram)
5. [Auth Routes](#5-auth-routes)
6. [Dashboard Routes](#6-dashboard-routes)
7. [Dynamic Routes](#7-dynamic-routes)
8. [Middleware & Route Protection](#8-middleware--route-protection)
9. [Navigation Flow](#9-navigation-flow)
10. [Adding New Routes](#10-adding-new-routes)

---

## 1. Routing Philosophy

FullPrep uses **Next.js 16 App Router** file-system–based routing. Every `page.tsx` file inside `app/` automatically becomes a URL route. The routing system is organized into **route groups** — directories wrapped in parentheses — that allow layout sharing without affecting the URL path.

**Core principles**:
- Each route group has exactly one `layout.tsx` that persists across in-group navigations
- Route groups do not appear in URLs
- Dynamic routes use `[paramName]` bracket syntax
- Protected routes are managed by `middleware.ts` at the Edge

---

## 2. Complete Route Map

| URL | File Path | Layout | Auth Required |
|---|---|---|---|
| `/login` | `app/(auth)/login/page.tsx` | Auth Layout | No |
| `/signup` | `app/(auth)/signup/page.tsx` | Auth Layout | No |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Auth Layout | No |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Auth Layout | No |
| `/` | `app/(dashboard)/page.tsx` | Dashboard Layout | Yes |
| `/problems` | `app/(dashboard)/problems/page.tsx` | Dashboard Layout | Yes |
| `/problems/:slug` | `app/(dashboard)/problems/[slug]/page.tsx` | Dashboard Layout | Yes |
| `/profile` | `app/(dashboard)/profile/page.tsx` | Dashboard Layout | Yes |
| `/settings` | `app/(dashboard)/settings/page.tsx` | Dashboard Layout | Yes |
| `/leaderboard` | `app/(dashboard)/leaderboard/page.tsx` | Dashboard Layout | Yes |
| `/contests` | `app/(dashboard)/contests/page.tsx` | Dashboard Layout | Yes |
| `/submissions` | `app/(dashboard)/submissions/page.tsx` | Dashboard Layout | Yes |
| `/bookmarks` | `app/(dashboard)/bookmarks/page.tsx` | Dashboard Layout | Yes |
| `/ai-hints` | `app/(dashboard)/ai-hints/page.tsx` | Dashboard Layout | Yes |
| `/learning` | `app/(dashboard)/learning/page.tsx` | Dashboard Layout | Yes |
| `/learning-paths` | `app/(dashboard)/learning-paths/page.tsx` | Dashboard Layout | Yes |
| `/stats` | `app/(dashboard)/stats/page.tsx` | Dashboard Layout | Yes |
| `/activity` | `app/(dashboard)/activity/page.tsx` | Dashboard Layout | Yes |
| `/notifications` | `app/(dashboard)/notifications/page.tsx` | Dashboard Layout | Yes |

---

## 3. Route Groups Explained

### `(auth)` Route Group

```
app/(auth)/
├── layout.tsx          ← Renders: dark gradient bg + centered glass card
├── login/page.tsx      → /login
├── signup/page.tsx     → /signup
├── forgot-password/page.tsx → /forgot-password
└── reset-password/page.tsx  → /reset-password
```

The auth layout renders a visually rich fullscreen background with animated gradient blobs and a centered glass-morphism card containing the auth form. It does **not** render the Sidebar or Navbar.

**URL impact**: None — `(auth)` does not appear in the URL. `/login` is just `/login`.

---

### `(dashboard)` Route Group

```
app/(dashboard)/
├── layout.tsx          ← Renders: DashboardLayout (Sidebar + Navbar + main)
├── page.tsx            → / (Overview)
├── problems/
│   ├── page.tsx        → /problems
│   └── [slug]/page.tsx → /problems/:slug
├── profile/page.tsx    → /profile
├── settings/page.tsx   → /settings
└── ... (all other dashboard pages)
```

The dashboard layout wraps every page with the full application shell. When navigating between dashboard routes (e.g., `/problems` → `/profile`), the Sidebar and Navbar do **not remount** — only the `<main>` content updates.

---

### `(public)` Route Group

```
app/(public)/
└── layout.tsx          ← Renders: Navbar + Footer (marketing layout)
```

Currently the public group only has a layout. It's ready to receive landing pages, pricing pages, or blog pages without affecting the dashboard URL structure.

---

## 4. Layout Nesting Diagram

```
Browser Visit: /problems/two-sum
                │
                ▼
    ┌─────────────────────────────────────┐
    │  app/layout.tsx (Root Layout)       │
    │  ├─ <html lang="en" class="dark">   │
    │  └─ <ThemeProvider>                 │
    │       └─ <DashboardProvider>        │
    │            │                        │
    │  ┌─────────────────────────────┐    │
    │  │ app/(dashboard)/layout.tsx  │    │
    │  │ └─ <DashboardLayout>        │    │
    │  │      ├─ <Sidebar />         │    │
    │  │      ├─ <Navbar />          │    │
    │  │      └─ <main>              │    │
    │  │           │                 │    │
    │  │  ┌────────────────────────┐ │    │
    │  │  │ problems/[slug]/       │ │    │
    │  │  │ page.tsx               │ │    │
    │  │  │ (ProblemSolver UI)     │ │    │
    │  │  └────────────────────────┘ │    │
    │  └─────────────────────────────┘    │
    └─────────────────────────────────────┘
```

**Navigation between `/problems` and `/profile`**:
```
Before:                        After:
┌─ Root Layout ──────────┐    ┌─ Root Layout ──────────┐
│  ┌─ Dashboard Layout ─┐│    │  ┌─ Dashboard Layout ─┐│
│  │  Sidebar ✓         ││    │  │  Sidebar ✓         ││  ← Sidebar PERSISTS
│  │  Navbar ✓          ││    │  │  Navbar ✓          ││  ← Navbar PERSISTS
│  │  <main>            ││    │  │  <main>            ││
│  │   Problems Page    ││ →  │  │   Profile Page     ││  ← Only this changes
│  └────────────────────┘│    │  └────────────────────┘│
└────────────────────────┘    └────────────────────────┘
```

This is the key advantage of Next.js App Router nested layouts — persistent shell with swappable content.

---

## 5. Auth Routes

### `/login`

- Renders: Email + Password form
- On success: Calls `authStore.login()`, redirects to `/`
- On failure: Displays error message via `handleApiError`
- Links to: `/signup`, `/forgot-password`

### `/signup`

- Renders: Name + Email + Password + Confirm Password form
- Validated with Zod schema from `/schemas`
- On success: Redirects to `/login` or auto-login → `/`

### `/forgot-password`

- Renders: Email input form
- Submits to backend to trigger reset email
- Shows success/error toast

### `/reset-password`

- Renders: New Password + Confirm Password form
- Reads `token` from query params (`?token=...`)
- Submits new password to backend

---

## 6. Dashboard Routes

### `/` — Overview Dashboard

- **Component**: `app/(dashboard)/page.tsx`
- **Renders**: Hero, StatsGrid, Analytics (charts), RecentProblemsTable
- **Data**: Mock data from `mocks/` (real API integration planned)
- **Sidebar active item**: "Overview" (exact match `pathname === "/"`)

### `/problems` — Problem Library

- **Component**: `app/(dashboard)/problems/page.tsx`
- **Renders**: Search input, topic filter chips, difficulty filter, problem rows
- **State**: Local `useState` for filters, search term
- **Sidebar active item**: "Problems"

### `/leaderboard`

- **Renders**: Global ranking table with position, username, solved count, rating, badge
- **Data**: `LeaderboardService.getLeaderboard()`

### `/contests`

- **Renders**: Upcoming and past contests cards with countdown timers
- **Data**: `ContestsService.getContests()`
- **Charts**: `ChartCard` components with Recharts

### `/ai-hints`

- **Renders**: AI hint interface — problem input + generated hint output
- **Sidebar special**: Streak Card is replaced by the Upgrade to Pro Card
- **Note**: This is the only route where the sidebar renders a different bottom card

### `/submissions`

- **Renders**: Submission history table with problem name, status, language, timestamp
- **Data**: `SubmissionsService.getSubmissions()`

### `/bookmarks`

- **Renders**: Saved/bookmarked problems grid
- **Data**: `BookmarksService.getBookmarks()`

### `/profile`

- **Renders**: User profile with avatar, stats, tab sections (Overview / Submissions / Bookmarks)
- **Data**: `AuthService.getCurrentUser()` + `ProfileService`

### `/settings`

- **Renders**: Settings form panels (Account, Appearance, Notifications, Privacy)
- **State**: Local form state + Zod validation

### `/stats`

- **Renders**: Detailed problem-solving analytics — heatmap calendar, difficulty breakdown, topic coverage

### `/activity`

- **Renders**: Activity feed timeline

### `/notifications`

- **Renders**: Notification list with read/unread state
- **Data**: `NotificationsService.getNotifications()`

### `/learning`

- **Renders**: Learning modules with progress tracking

### `/learning-paths`

- **Renders**: Structured learning path roadmaps

---

## 7. Dynamic Routes

### `/problems/[slug]`

**File**: `app/(dashboard)/problems/[slug]/page.tsx`

**URL pattern**: `/problems/two-sum`, `/problems/binary-search`, etc.

**Slug generation**:
```ts
// In ProblemsService.getProblemBySlug():
p.title.toLowerCase()
  .replace(/\s+/g, "-")
  .replace(/[^a-z0-9-]/g, "")
// "Two Sum" → "two-sum"
// "Valid Parentheses" → "valid-parentheses"
```

**Page behavior**:
1. Receives `params.slug` from Next.js
2. Calls `ProblemsService.getProblemBySlug(slug)` to resolve the problem
3. If not found, renders a "Problem not found" error UI
4. If found, renders the full split-pane editor interface

**Route params type**:
```ts
interface PageProps {
  params: Promise<{ slug: string }>;
}
```

> Note: In Next.js 16, `params` is a **Promise** that must be `await`ed. This is a breaking change from Next.js 14.

---

## 8. Middleware & Route Protection

**File**: `middleware.ts`

```ts
export const config = {
  matcher: [
    "/",
    "/profile/:path*",
    "/settings/:path*",
    "/bookmarks/:path*",
    "/submissions/:path*",
  ],
};
```

The middleware currently **passes all requests through** (`NextResponse.next()`). The auth check is scaffolded and ready to activate:

```ts
// Activate when backend JWT is connected:
const token = request.cookies.get("session-token");
if (!token) {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

**When to extend the matcher**: Add any new protected route paths to the `matcher` array. Use `:path*` to protect an entire sub-tree (e.g., `/admin/:path*`).

---

## 9. Navigation Flow

### Authenticated User Flow

```
/ (login) → authStore.login() → router.push("/") → Dashboard
```

### Problem Solving Flow

```
/problems (list) → click row → router.push("/problems/[slug]") → Editor
```

### Sign Out Flow

```
Sidebar Profile Card → click "Sign Out"
    → showToast("Signed out successfully", "success")
    → setTimeout 500ms
    → authStore.logout()
    → router.push("/login")
```

### Sidebar Navigation

```
User clicks nav item (e.g., "Leaderboard")
    → Link href="/leaderboard"
    → setIsMobileSidebarOpen(false)  ← Close mobile drawer
    → Next.js client navigation
    → Dashboard layout persists
    → Only <main> re-renders with /leaderboard content
```

---

## 10. Adding New Routes

### Adding a New Dashboard Page

1. Create the page file:
   ```
   app/(dashboard)/analytics/page.tsx
   ```

2. Export a default component:
   ```tsx
   export default function AnalyticsPage() {
     return <div>Analytics</div>;
   }
   ```

3. Add to sidebar navigation (`constants/navigation.ts`):
   ```ts
   { name: "Analytics", icon: BarChart2, badge: null, href: "/analytics" }
   ```

4. *(Optional)* Add to middleware matcher if it should be protected:
   ```ts
   matcher: ["/analytics/:path*"]
   ```

The new page automatically:
- Gets the Dashboard Layout (Sidebar + Navbar)
- Gets the correct active state in Sidebar
- Is theme-aware via CSS variables
- Gets `loading.tsx` Suspense boundary for free

### Adding a New Auth Page

1. Create:
   ```
   app/(auth)/verify-email/page.tsx
   ```

2. No sidebar or navbar — the auth layout handles the visual shell.

### Adding a Dynamic Route

```
app/(dashboard)/users/[username]/page.tsx
```

Access params:
```tsx
export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  // fetch user data by username
}
```
