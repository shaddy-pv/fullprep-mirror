# FullPrep — Frontend Architecture Guide

> **Audience**: Frontend engineers, contributors, and technical reviewers.  
> **Version**: 1.0 · Next.js 16 App Router · React 19 · TailwindCSS 4

---

## Table of Contents

1. [Overview](#1-overview)
2. [Next.js App Router Architecture](#2-nextjs-app-router-architecture)
3. [Route Groups & Layout System](#3-route-groups--layout-system)
4. [Dashboard Layout Architecture](#4-dashboard-layout-architecture)
5. [Component Architecture](#5-component-architecture)
6. [File-by-File Documentation](#6-file-by-file-documentation)
7. [Monaco Editor Integration](#7-monaco-editor-integration)
8. [Theme Architecture](#8-theme-architecture)
9. [Sidebar Architecture](#9-sidebar-architecture)
10. [Profile & Settings Architecture](#10-profile--settings-architecture)
11. [Architectural Decision Records](#11-architectural-decision-records)

---

## 1. Overview

FullPrep is a **single-repository, full-stack** project where the **frontend is a Next.js 16 App Router application** living at the project root. The frontend is the primary engineering surface — it handles all UI rendering, state management, API integration, routing, and theming.

### High-Level Mental Model

```
Browser Request
      │
      ▼
Next.js Middleware (middleware.ts)
      │  ← route protection logic (scaffolded)
      ▼
Route Group Layout
  ┌───────────────────────────────────┐
  │  app/layout.tsx (Root)            │
  │    └─ ThemeProvider               │
  │         └─ DashboardProvider      │
  │              └─ Page Children     │
  └───────────────────────────────────┘
      │
      ├── (auth)/layout.tsx     → Centered auth card UI
      ├── (dashboard)/layout.tsx → DashboardLayout (Sidebar + Navbar)
      └── (public)/layout.tsx   → Navbar + Footer
```

The root layout (`app/layout.tsx`) wraps everything in `ThemeProvider`, which internally composes `DashboardProvider`. This means **theme state and sidebar state are available globally** to all components, in any route group.

---

## 2. Next.js App Router Architecture

### Why App Router?

Next.js 16 App Router was chosen over the Pages Router for:

| Benefit | Impact |
|---|---|
| **Nested layouts** | Each route group has its own persistent layout — no layout remounts on navigation |
| **Server Components by default** | Better initial load performance; client components explicitly opt in with `"use client"` |
| **Streaming + Suspense** | `loading.tsx` files give instant skeleton UIs on every route |
| **Route groups** | Clean code organization by feature — auth, dashboard, public — without affecting URLs |
| **Parallel routes** | Future capability for split-pane UI (e.g., editor + problem description) |

### Server vs. Client Components

| Type | Files | Reason |
|---|---|---|
| **Server Component** | Most `page.tsx` files, `layout.tsx` | Static structure, no interactivity |
| **Client Component** | All components in `components/`, stores, hooks | Require browser APIs, event handlers, Zustand |

All components that use `useState`, `useEffect`, `useTheme`, `useSidebarStore`, etc. carry the `"use client"` directive. This directive is placed at the **file level** at the top of the file.

> **Important**: In Next.js App Router, `"use client"` is a **boundary declaration**, not a runtime mode. It means "this component and its entire subtree can use browser APIs." Children of a Client Component do not need `"use client"` unless they are imported independently.

---

## 3. Route Groups & Layout System

Route groups use parentheses in directory names: `(auth)`, `(dashboard)`, `(public)`. These are **invisible to the URL** — they exist purely for layout grouping.

### Layout Hierarchy

```
app/
├── layout.tsx                  ← Root Layout: font, ThemeProvider (wraps ALL routes)
│
├── (auth)/
│   └── layout.tsx              ← Auth Layout: gradient bg, centered card, animated blobs
│       ├── login/page.tsx
│       ├── signup/page.tsx
│       ├── forgot-password/page.tsx
│       └── reset-password/page.tsx
│
├── (dashboard)/
│   └── layout.tsx              ← Dashboard Layout: DashboardLayout component
│       ├── page.tsx            ← / (Overview Dashboard)
│       ├── problems/
│       │   ├── page.tsx        ← Problems list
│       │   └── [slug]/page.tsx ← Individual problem + Monaco editor
│       ├── profile/page.tsx
│       ├── settings/page.tsx
│       ├── leaderboard/page.tsx
│       ├── contests/page.tsx
│       ├── submissions/page.tsx
│       ├── bookmarks/page.tsx
│       ├── ai-hints/page.tsx
│       ├── learning/page.tsx
│       ├── learning-paths/page.tsx
│       ├── stats/page.tsx
│       ├── activity/page.tsx
│       └── notifications/page.tsx
│
└── (public)/
    └── layout.tsx              ← Public Layout: Navbar + Footer
```

### Why this Layout Strategy?

**Without route groups**, you'd need to conditionally render `<Sidebar>` inside every page or maintain global layout state. With route groups:

- The **auth layout** renders only on `/login`, `/signup`, etc. — no sidebar, no navbar, just the auth card
- The **dashboard layout** renders `DashboardLayout` for every protected page automatically
- The **public layout** renders marketing-style Navbar + Footer
- Layouts **persist across navigations within the same group** — the Sidebar does not remount when navigating from `/problems` to `/profile`

---

## 4. Dashboard Layout Architecture

### Component Tree

```
DashboardLayout (components/layout/DashboardLayout.tsx)
├── Mobile Overlay Backdrop     ← Semi-transparent blur backdrop for drawer
├── Sidebar (components/layout/Sidebar.tsx)
│   ├── Logo + Mobile Close Button
│   ├── Navigation Links (SIDEBAR_MENU_ITEMS)
│   ├── Streak Glassmorphism Card / Upgrade to Pro Card
│   ├── AnimatePresence → Mini Profile Popover (Framer Motion)
│   └── Bottom Profile Card (click to open popover)
├── Navbar (components/layout/Navbar.tsx)
│   ├── Hamburger (mobile) / Collapse Toggle (desktop)
│   ├── Page Title
│   ├── Search Bar
│   ├── Notification Bell
│   └── ThemeToggle
└── <main>
    └── {children}             ← Route page content renders here
```

### Responsive Behavior

| Breakpoint | Sidebar Behavior |
|---|---|
| `< md` (< 768px) | Hidden off-screen (`-translate-x-full`); opens as slide-over drawer |
| `≥ md` (≥ 768px) | Always visible; collapses to `80px` icon-only or expands to `270px` |

The `DashboardLayout` uses a single wrapper `div` with `h-screen overflow-hidden` to prevent the page body from ever scrolling. Only the `<main>` region has `overflow-y-auto`, ensuring the sidebar and navbar remain fixed in view.

### State Flow in DashboardLayout

```
useDashboard() hook (from DashboardContext)
    ↓
{ isSidebarCollapsed, setIsSidebarCollapsed,
  isMobileSidebarOpen, setIsMobileSidebarOpen }
    ↓
DashboardLayout.tsx  →  Sidebar.tsx, Navbar.tsx
```

`DashboardContext` bridges `useSidebarStore` (Zustand) with the `useTheme` hook from `next-themes`, providing a single ergonomic `useDashboard()` interface for layout components.

---

## 5. Component Architecture

### Component Categories

```
components/
├── ui/           ← Primitive design system components (no domain logic)
├── layout/       ← Application shell: sidebar, navbar, footer, layout wrappers
├── dashboard/    ← Dashboard-page-specific components
├── editor/       ← Monaco editor ecosystem components
├── problems/     ← Problem list, filters, description panel
├── contests/     ← Contest cards, timers, leaderboards
├── learning/     ← Learning path cards, progress trackers
└── auth/         ← Login/signup form components
```

### Reusable UI Primitive Strategy

The `components/ui/` folder contains **pure presentation components** — they accept props and render UI. They have:
- No Zustand dependencies
- No API calls
- No routing logic
- Typed props via TypeScript interfaces
- Class composition via `cn()` (clsx + tailwind-merge)

This makes them independently testable and reusable across any page.

### Domain Component Strategy

Components in `components/dashboard/`, `components/editor/`, etc., are **domain-aware** — they may consume Zustand stores, call services, and contain business logic. They are **colocated with their feature** rather than the page to enable reuse across multiple pages with the same domain.

---

## 6. File-by-File Documentation

---

### `app/layout.tsx`

**Purpose**: Root layout — wraps the entire application.

**What it does**:
- Loads the Inter font from Google Fonts with variable weight support (300–800)
- Registers `--font-inter` CSS variable for use in `globals.css`
- Applies `suppressHydrationWarning` on `<html>` to prevent React hydration errors from theme class differences (dark/light)
- Wraps children in `ThemeProvider` which injects `next-themes` and `DashboardProvider`
- Applies base body classes: `bg-bg-page text-text-primary transition-colors duration-300`

**Used by**: Every route in the application (automatic Next.js convention)

**Dependencies**: `ThemeProvider`, `Inter` (next/font/google)

---

### `app/globals.css`

**Purpose**: Global stylesheet — design token definitions, Tailwind theme extension, base styles.

**What it does**:
- Imports TailwindCSS v4 via `@import "tailwindcss"`
- Defines the `@theme` block mapping CSS variables to Tailwind utility classes (`bg-bg-page`, `text-text-primary`, etc.)
- Declares `:root` (light mode) CSS variable values
- Declares `.dark` class CSS variable overrides (dark mode values)
- Defines `@variant dark` strategy using class-based dark mode (`&:where(.dark, .dark *)`)
- Sets premium Inter typography: `font-feature-settings`, `letter-spacing: -0.015em`
- Defines custom scrollbar styles for a branded minimal look
- Provides `.no-scrollbar` utility class for scroll-hidden regions

**Key design tokens**:

```css
/* Light mode */
--background: #f5f7fb;
--card-bg: rgba(255, 255, 255, 0.90);
--text-primary: #111827;

/* Dark mode */
--background: #0b0f17;
--card-bg: #0b1020;
--text-primary: #ffffff;

/* Brand */
--color-brand-orange: #ff6a00;
```

---

### `app/(auth)/layout.tsx`

**Purpose**: Authentication route group layout — renders the animated background and centered auth card container.

**What it does**:
- Renders a full-screen dark background with gradient blobs and glassmorphism card frame
- Wraps all auth pages (`/login`, `/signup`, `/forgot-password`, `/reset-password`)
- Contains Framer Motion entrance animations for the auth card
- Does NOT render Sidebar or Navbar

---

### `app/(dashboard)/layout.tsx`

**Purpose**: Dashboard route group layout — delegates to `DashboardLayout` component.

**What it does**:
- A minimal wrapper that renders `<DashboardLayout>{children}</DashboardLayout>`
- Applies to all routes under `(dashboard)/` automatically

---

### `app/(dashboard)/page.tsx`

**Purpose**: Dashboard overview page — the root `/` route.

**What it does**:
- Renders the main dashboard with Hero section, Stats Grid, Chart Cards, and Recent Problems Table
- Imports and composes `Hero`, `StatsGrid`, `Analytics`, `RecentProblemsTable`

---

### `app/(dashboard)/problems/page.tsx`

**Purpose**: Problems library page.

**What it does**:
- Renders the searchable, filterable problem list
- Handles topic filtering, difficulty filtering, search input
- Displays problems in a table with difficulty badges, tags, acceptance rate
- Links each row to the `/problems/[slug]` editor page

---

### `app/(dashboard)/problems/[slug]/page.tsx`

**Purpose**: Individual problem page with Monaco editor.

**What it does**:
- Resolves the problem by slug using `ProblemsService.getProblemBySlug(slug)`
- Renders a split-pane layout: `ProblemDescription` (left) + Monaco Editor (right)
- Integrates `EditorToolbar`, `EditorSettings`, `OutputConsole`
- Reads/writes editor state from `useEditorStore`

---

### `components/layout/DashboardLayout.tsx`

**Purpose**: Application shell for all dashboard pages.

**What it does**:
- Renders the full-height flex layout: Sidebar (left) + Content Column (right)
- Manages mobile drawer overlay backdrop
- Reads sidebar state from `useDashboard()`
- Conditionally transforms sidebar with CSS `translate` for mobile drawer behavior

**UI responsibilities**: Layout composition, responsive breakpoint handling

**State responsibilities**: Reads `isSidebarCollapsed`, `isMobileSidebarOpen`, `setIsMobileSidebarOpen`

---

### `components/layout/Sidebar.tsx`

**Purpose**: Primary navigation sidebar — the most complex component in the application.

**What it does**:
- Renders all navigation links from `SIDEBAR_MENU_ITEMS` with active state detection via `usePathname()`
- Active state: orange left-border accent + orange icon + glowing orange card background
- Supports **collapsed mode** (80px, icon-only) and **expanded mode** (270px, icon + label)
- Transitions between modes with `transition-all duration-300` and `overflow-hidden` label hiding
- Renders the **Streak Card** (glassmorphism, shows 7-day streak dots) — hidden on `/ai-hints`
- Renders the **Upgrade to Pro** card on `/ai-hints` path only
- Renders the **bottom profile card** with click-to-open **mini profile popover**
- Mini popover uses Framer Motion `AnimatePresence` for entrance/exit animation
- Popover position adapts: above profile card (expanded) or to the right (collapsed)
- Handles sign-out: shows toast notification, then redirects to `/login` after 500ms
- Handles mobile close button (X) to collapse mobile drawer
- Always dark regardless of app theme (hardcoded `bg-[#06090f]`)

**Dependencies**: `DashboardContext`, `notificationStore`, `constants/navigation.ts`, `lucide-react`, Framer Motion

---

### `components/layout/Navbar.tsx`

**Purpose**: Top navigation bar for dashboard pages.

**What it does**:
- Renders sidebar collapse toggle button (desktop)
- Renders hamburger menu button (mobile) to open sidebar drawer
- Displays current page title (derived from route)
- Provides a search input
- Displays notification bell with unread count badge from `notificationStore`
- Renders `ThemeToggle` component
- User avatar display

---

### `components/layout/Footer.tsx`

**Purpose**: Public layout footer.

**What it does**:
- Renders links, social icons, and brand information
- Only visible in `(public)` route group

---

### `components/layout/PageHeader.tsx`

**Purpose**: Reusable page section header with title and optional description/CTA.

---

### `components/layout/ContentContainer.tsx`

**Purpose**: Constrains content to `THEME_SPACING.contentMaxWidth` (1300px) with horizontal padding.

---

### `components/layout/ResponsiveGrid.tsx`

**Purpose**: Configurable CSS grid component for responsive card layouts.

---

### `components/layout/SectionWrapper.tsx`

**Purpose**: Applies consistent vertical spacing between page sections.

---

### `components/dashboard/Hero.tsx`

**Purpose**: Main dashboard hero section showing welcome message, quick stats, and CTA.

**What it does**:
- Renders animated greeting with user name from `authStore`
- Shows summary stats (streak, solved count, rating)
- Contains Framer Motion stagger animation for entrance

---

### `components/dashboard/StatCard.tsx`

**Purpose**: Individual stat display card with icon, value, label, and trend indicator.

---

### `components/dashboard/StatsGrid.tsx`

**Purpose**: Grid layout composing multiple `StatCard` components.

---

### `components/dashboard/ChartCard.tsx`

**Purpose**: Wrapper card for Recharts charts — submission history, difficulty pie, etc.

**What it does**:
- Renders Recharts `LineChart`, `PieChart` with theme-aware colors
- Accepts chart data as props
- Applies glassmorphism card styling

---

### `components/dashboard/Analytics.tsx`

**Purpose**: Analytics section composing multiple `ChartCard` components in a grid.

---

### `components/dashboard/RecentProblemsTable.tsx`

**Purpose**: Shows a table of the user's recently attempted problems.

---

### `components/dashboard/TableRow.tsx`

**Purpose**: Individual row in the recent problems table with status icon, difficulty badge, and timestamp.

---

### `components/editor/MonacoEditor.tsx`

**Purpose**: Thin wrapper around `@monaco-editor/react` that maps `editorStore` settings to Monaco `options`.

**What it does**:
- Accepts all editor configuration as typed props
- Maps `language` prop to Monaco language identifier (e.g., `"cpp"` → `"cpp"`)
- Enables `automaticLayout: true` for container-responsive resizing
- Uses `"var(--font-mono, monospace)"` for font to respect CSS font stack
- Sets `scrollBeyondLastLine: false`, `cursorBlinking: "smooth"` for premium feel
- `"use client"` required (Monaco is browser-only)

---

### `components/editor/EditorToolbar.tsx`

**Purpose**: Top bar of the editor pane — language selector, run button, fullscreen toggle.

**What it does**:
- Reads/writes `language` from `useEditorStore`
- Triggers code execution (connected to OutputConsole)
- Handles fullscreen toggle (`setIsFullscreen`)

---

### `components/editor/EditorSettings.tsx`

**Purpose**: Settings panel for the editor (font size, theme, word wrap, minimap, tab size, line numbers).

**What it does**:
- Reads `settings` from `useEditorStore`
- Calls `updateSetting(key, value)` for each change
- Renders as a slide-in panel or modal

---

### `components/editor/OutputConsole.tsx`

**Purpose**: Bottom output panel showing test results, console output, and submission results.

**What it does**:
- Reads `activeTab` from `useEditorStore`
- Renders tabs: Testcase / Result / Console
- Displays pass/fail indicators, expected vs actual output

---

### `components/editor/ProblemDescription.tsx`

**Purpose**: Left pane of the problem solver — problem statement, examples, constraints.

**What it does**:
- Renders problem title, difficulty badge, topic tags
- Renders description with example blocks (input/output/explanation)
- Renders constraints list

---

### `components/ui/Button.tsx`

**Purpose**: Primary reusable button primitive.

**Variants**: `primary` (brand orange), `secondary` (ghost), `danger`

**Props**: `variant`, `size`, `onClick`, `disabled`, `children`, `className`

---

### `components/ui/Badge.tsx`

**Purpose**: Status and label badge.

**Variants**: `ai` (purple gradient), `easy` (green), `medium` (orange), `hard` (red)

---

### `components/ui/DifficultyBadge.tsx`

**Purpose**: Specialized badge for problem difficulty with semantic color coding.

---

### `components/ui/Modal.tsx`

**Purpose**: Accessible overlay modal with Framer Motion entrance animation, backdrop click dismiss, and Escape key handler.

---

### `components/ui/Skeleton.tsx`

**Purpose**: Animated shimmer skeleton placeholder for loading states.

---

### `components/ui/Loader.tsx`

**Purpose**: Spinner component for inline or full-screen loading states.

---

### `components/ui/ProgressBar.tsx`

**Purpose**: Horizontal progress bar with optional label and branded orange fill.

---

### `components/ui/ErrorBoundary.tsx`

**Purpose**: React class-based error boundary catching render errors and showing fallback UI.

---

### `components/ui/ThemeToggle.tsx`

**Purpose**: Interactive dark/light theme toggle switch.

**What it does**:
- Uses `useTheme` from `next-themes` to read and set the theme
- Guards with `mounted` state to avoid hydration mismatch
- Renders a sliding pill switch with Sun/Moon icons
- Defaults to dark appearance before mount to prevent flash

---

### `components/ui/DashboardCard.tsx`

**Purpose**: Glassmorphism-styled card container — the base surface for dashboard widgets.

---

### `components/ui/SectionHeader.tsx`

**Purpose**: Section title + optional subtitle + optional CTA link, used above content groups.

---

### `store/DashboardContext.tsx`

**Purpose**: React Context bridge that combines `next-themes` theme state with `useSidebarStore` Zustand state into one consumable context.

**Why Context here instead of pure Zustand?**

`next-themes` provides theme via its own context hook (`useTheme`). Zustand cannot directly consume another library's context. `DashboardContext` acts as a **composition layer** — it reads from both systems and re-exports everything through a single `useDashboard()` hook.

It also handles sidebar state **persistence on mount**:

```ts
useEffect(() => {
  const saved = localStorage.getItem("sidebar-collapsed") === "true";
  if (saved) sidebar.setIsSidebarCollapsed(true);
}, []);
```

---

### `providers/ThemeProvider.tsx`

**Purpose**: Composes `next-themes`'s `ThemeProvider` with `DashboardProvider`.

**Configuration**:
- `attribute="class"` → Applies dark mode via `.dark` class on `<html>`
- `defaultTheme="dark"` → Dark mode on first visit
- `enableSystem={false}` → Ignores OS preference (intentional product decision)

---

### `middleware.ts`

**Purpose**: Next.js Edge middleware for route protection.

**Current state**: Scaffolded but inactive. The matcher covers protected routes (`/`, `/profile/:path*`, `/settings/:path*`, `/bookmarks/:path*`, `/submissions/:path*`). The auth check logic is commented out, ready to be activated when the backend JWT is connected.

**When activated**:
```ts
const token = request.cookies.get("session-token");
if (!token) return NextResponse.redirect(new URL("/login", request.url));
```

---

### `lib/api.ts`

**Purpose**: HTTP client factory — thin wrappers over `fetcher` for GET, POST, PUT, DELETE.

**What it does**:
- Provides `api.get<T>(url)`, `api.post<T>(url, body)`, `api.put<T>(url, body)`, `api.delete<T>(url)`
- All methods are fully generic — return type `T` is inferred from caller
- Automatically sets `Content-Type: application/json`

---

### `lib/fetcher.ts`

**Purpose**: Base HTTP fetch wrapper with production-grade reliability features.

**What it does**:
- Implements **AbortController** timeout (default 10 seconds)
- Throws `ApiError` on non-OK responses with structured error data
- Handles `AbortError` (timeout) separately with a user-friendly message
- Parses JSON response body automatically

---

### `lib/error-handler.ts`

**Purpose**: Structured error handling utilities.

**What it does**:
- Defines `ApiError` class with `statusCode` and optional `errors` (field-level validation errors)
- `handleApiError(error)` converts any thrown value to a user-readable string:
  - 401 → "Session expired. Please log in again."
  - 422 → joins field validation errors
  - Other `ApiError` → `error.message`
  - Generic `Error` → `error.message`
  - Unknown → "An unexpected network error occurred."

---

### `lib/utils.ts`

**Purpose**: `cn()` utility — merges Tailwind classes with conflict resolution.

```ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

This prevents class conflicts like `px-4 px-8` — `tailwind-merge` intelligently keeps the last value.

---

## 7. Monaco Editor Integration

The editor integration consists of 5 components working in concert:

```
useEditorStore (Zustand)
      │
      ├── EditorToolbar.tsx    ← language, fullscreen, run controls
      ├── MonacoEditor.tsx     ← actual @monaco-editor/react instance
      ├── EditorSettings.tsx   ← font, theme, minimap, tabSize, etc.
      └── OutputConsole.tsx    ← testcase / result / console tabs
```

### `MonacoEditor.tsx` props contract:

```ts
interface MonacoEditorProps {
  language: string;       // "javascript" | "python" | "cpp" | "java"
  theme: string;          // "vs-dark" | "light"
  value: string;          // Current code content
  onChange: (val: string) => void;
  fontSize: number;       // from editorStore.settings.fontSize
  minimapEnabled: boolean;
  lineNumbers: "on" | "off";
  wordWrap: "on" | "off";
  tabSize: number;
}
```

### Key architectural decisions:

1. **`"use client"` required** — Monaco is a browser-only library; it cannot run on the server
2. **`automaticLayout: true`** — Monaco auto-resizes when the container dimensions change (important for responsive/fullscreen transitions)
3. **Absolute positioning** — The editor `div` uses `absolute inset-0` to fill its relative-positioned parent perfectly, ensuring no height calculation issues
4. **Font inheritance** — `fontFamily: "var(--font-mono, monospace)"` respects the CSS monospace font stack

---

## 8. Theme Architecture

See [THEME_SYSTEM.md](./THEME_SYSTEM.md) for the complete theme architecture.

**Quick summary**:

```
globals.css                    ← Token definitions (CSS vars)
    ↓
next-themes (ThemeProvider)    ← Applies .dark class to <html>
    ↓
Tailwind @theme block          ← Maps CSS vars to utility classes
    ↓
Component classNames           ← bg-bg-page, text-text-primary, etc.
```

**Sidebar exception**: The Sidebar always renders with hardcoded dark values (`bg-[#06090f]`). This is intentional — the sidebar serves as a permanent visual anchor and should never invert to white.

---

## 9. Sidebar Architecture

The Sidebar is the most architecturally complex component in the codebase. Here's why:

### State interactions

```
useDashboard()
  ├── isSidebarCollapsed   → controls width (80px vs 270px)
  └── setIsMobileSidebarOpen → closes drawer on nav item tap

useNotificationStore()
  └── showToast            → triggers toast on sign-out

usePathname()
  └── pathname             → determines active nav item

useRouter()
  └── router.push("/login") → redirects after sign-out
```

### Active state logic

```ts
const isActive = item.href === "/"
  ? pathname === "/"
  : item.href !== "#" && pathname.startsWith(item.href);
```

The `/` route requires **exact match** to prevent it from matching all routes. All other routes use `startsWith` for sub-route active highlighting (e.g., `/problems/two-sum` highlights the Problems nav item).

### Collapse/Expand animation strategy

Labels animate out by transitioning to `w-0 opacity-0` rather than using `display: none`. This allows CSS transitions to work smoothly.

```css
/* Collapsed: label hidden */
className={isSidebarCollapsed ? "w-0 opacity-0 pointer-events-none absolute" : "w-auto opacity-100 ml-3.5"}
```

### Context-aware bottom card

The bottom section switches between two cards based on the current route:
- All routes → **Streak Card** (glassmorphism, 7-day dot visualization)
- `/ai-hints` route → **Upgrade to Pro Card** (CTAs, gradient background)

This route-awareness in the sidebar prevents layout overflow on the `ai-hints` page where vertical space is constrained.

---

## 10. Profile & Settings Architecture

### Profile Page (`/profile`)

- Displays user avatar, name, role, stats
- Tab-based sections: Overview, Submissions, Bookmarks, Stats
- Data from `AuthService.getCurrentUser()` (currently mock)

### Settings Page (`/settings`)

- Sections: Account, Notifications, Appearance, Privacy
- Form state managed locally with `useState` + Zod schemas in `/schemas`
- Submits via `api.put("/users/settings", payload)`

---

## 11. Architectural Decision Records

### ADR-001: Route Groups over File-based Conditional Layouts

**Decision**: Use `(auth)`, `(dashboard)`, `(public)` route groups.

**Alternatives considered**: Single layout with conditional Sidebar rendering based on pathname.

**Rationale**: Route groups eliminate conditional logic in layouts, keep layouts focused, and ensure layouts never remount unnecessarily during in-group navigation.

---

### ADR-002: Zustand over Redux / React Query for Global State

**Decision**: Zustand for all global client state.

**Rationale**: Zustand's minimal API (zero boilerplate, no Provider needed, TypeScript-native) matches the project's complexity level. Redux would be over-engineered. React Query is planned for server cache state in a future iteration.

---

### ADR-003: CSS Variables over Hardcoded Tailwind Values for Theming

**Decision**: Define semantic design tokens as CSS custom properties in `globals.css`, map to Tailwind via `@theme`.

**Rationale**: CSS variables allow real-time theme switching without a full page reload. Hardcoded Tailwind classes like `bg-gray-900` would require `dark:` variants on every element — error-prone and harder to maintain.

---

### ADR-004: Sidebar Always Dark

**Decision**: Sidebar uses hardcoded dark background (`#06090f`) regardless of theme.

**Rationale**: The sidebar serves as a permanent navigation surface. In light mode, a white sidebar creates visual confusion and loses contrast hierarchy. The orange brand color pops more effectively against the dark sidebar surface.

---

### ADR-005: `mounted` Guard for Theme-Reading Components

**Decision**: All components that read the current theme must use a `mounted` state check before rendering theme-dependent UI.

**Rationale**: During SSR and initial hydration, the theme is indeterminate. Reading `useTheme()` before mount returns `undefined`, causing hydration mismatches. The `mounted` guard defaults to `"dark"` (matching `defaultTheme`) until the client has hydrated.

---

### ADR-006: Service Layer Abstraction

**Decision**: API calls are in `services/*.service.ts`, not directly in page components.

**Rationale**: Decouples UI from data fetching, enables easy swap from mocks to real API, and allows unit-testing services independently. Pages remain clean presentation components.
