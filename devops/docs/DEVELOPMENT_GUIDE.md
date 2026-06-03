# FullPrep — Development Guide

> **Reference**: Local setup, folder conventions, component creation rules, styling patterns, and safe development practices.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup](#2-local-development-setup)
3. [Scripts Reference](#3-scripts-reference)
4. [Environment Setup](#4-environment-setup)
5. [Folder Conventions](#5-folder-conventions)
6. [Component Creation Rules](#6-component-creation-rules)
7. [Page Creation Rules](#7-page-creation-rules)
8. [Styling Conventions](#8-styling-conventions)
9. [TypeScript Conventions](#9-typescript-conventions)
10. [Responsive UI Rules](#10-responsive-ui-rules)
11. [Theme-Safe Coding Rules](#11-theme-safe-coding-rules)
12. [UI Safety & Stability Guide](#12-ui-safety--stability-guide)
13. [Debugging Guide](#13-debugging-guide)

---

## 1. Prerequisites

| Tool | Minimum Version | Installation |
|---|---|---|
| Node.js | 18.x | [nodejs.org](https://nodejs.org) |
| npm | 9.x | Bundled with Node |
| Git | Any | [git-scm.com](https://git-scm.com) |

**Optional but recommended**:
- VS Code with extensions: ESLint, Tailwind CSS IntelliSense, Prettier

---

## 2. Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/fullprep.git
cd fullprep

# 2. Install all dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start the development server
npm run dev
```

The app runs at **http://localhost:3000** with Fast Refresh enabled. Changes to components, pages, styles, and stores reflect instantly without a full page reload.

### First-run checklist

- [ ] App loads at `http://localhost:3000`
- [ ] Dashboard sidebar renders in dark mode
- [ ] Theme toggle switches between dark and light
- [ ] Sidebar collapse/expand works
- [ ] Navigation links route correctly
- [ ] Monaco editor loads on a problem page (e.g., `/problems/two-sum`)

---

## 3. Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Next.js dev with HMR) |
| `npm run build` | Build production bundle (type-checks + compile) |
| `npm run start` | Start production server (requires `build` first) |
| `npm run lint` | Run ESLint on all source files |

> **Note**: `npm run build` is the best way to catch TypeScript errors before deploying. Run it before any PR.

---

## 4. Environment Setup

Create `.env.local` in the project root (this file is gitignored):

```env
# Backend API URL — no trailing slash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# App environment
NEXT_PUBLIC_APP_ENV=development
```

### `.env.example` (committed to git, no real values)

```env
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_APP_ENV=development
```

Always update `.env.example` when you add a new environment variable so teammates know it exists.

---

## 5. Folder Conventions

### Where does my file go?

| What you're creating | Folder |
|---|---|
| A new page (URL route) | `app/(dashboard)/your-page/page.tsx` |
| A new auth page | `app/(auth)/your-page/page.tsx` |
| A primitive UI component (no business logic) | `components/ui/` |
| A dashboard-specific component | `components/dashboard/` |
| An editor-specific component | `components/editor/` |
| A layout-structural component | `components/layout/` |
| A Zustand store | `store/yourFeatureStore.ts` |
| A custom React hook | `hooks/useYourHook.ts` |
| An API service | `services/yourDomain.service.ts` |
| A TypeScript type | `types/yourDomain.ts` |
| An app-wide constant | `constants/yourConstants.ts` |
| Mock data | `mocks/yourDomain.mock.ts` |

### File naming rules

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `StatCard.tsx`, `DifficultyBadge.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useDebounce.ts` |
| Stores | camelCase with `Store` suffix | `authStore.ts`, `editorStore.ts` |
| Services | camelCase with `.service.ts` suffix | `problems.service.ts` |
| Types | camelCase | `dashboard.ts`, `problems.ts` |
| Constants | camelCase | `navigation.ts`, `theme.ts` |
| Mocks | camelCase with `.mock.ts` suffix | `problems.mock.ts` |
| Pages | Always `page.tsx` (Next.js convention) | `page.tsx` |
| Layouts | Always `layout.tsx` (Next.js convention) | `layout.tsx` |

---

## 6. Component Creation Rules

### Rule 1: Always start with the interface

Define your props contract before writing JSX:

```tsx
interface MyCardProps {
  title: string;
  value: number;
  trend?: "up" | "down" | "neutral";
  className?: string;
}
```

### Rule 2: Use `cn()` for class composition

Never concatenate strings or use template literals for Tailwind classes:

```tsx
import { cn } from "@/lib/utils";

// ✅ Correct
<div className={cn("bg-card-bg rounded-xl", isActive && "border-brand-orange", className)}>

// ❌ Wrong
<div className={`bg-card-bg rounded-xl ${isActive ? "border-brand-orange" : ""} ${className}`}>
```

`tailwind-merge` inside `cn()` resolves class conflicts — `px-4 px-8` becomes `px-8`.

### Rule 3: Add `"use client"` only when needed

Components need `"use client"` if they use:
- `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- `useRouter`, `usePathname`
- Browser APIs (`localStorage`, `window`, `document`)
- Zustand stores or context hooks
- Event handlers

```tsx
"use client"; // ← Add at the very top of the file

import React, { useState } from "react";
```

### Rule 4: Composable, focused components

Each component should do one thing well. Prefer composition over large monolithic components:

```tsx
// ✅ Good: small, focused components composed together
<StatsGrid>
  <StatCard title="Solved" value={2031} icon={Code2} />
  <StatCard title="Streak" value={12} icon={Flame} />
</StatsGrid>

// ❌ Bad: one giant component handling everything
<DashboardOverviewWithStatsAndCharts />
```

### Rule 5: Export default, not named, for components

```tsx
// ✅ Correct (works with Next.js dynamic imports and lazy loading)
export default function StatCard({ ... }: StatCardProps) { }

// ❌ Avoid for components
export function StatCard() { }
```

Exception: Zustand stores and hooks always use named exports:

```ts
// ✅ Stores and hooks use named exports
export const useAuthStore = create<AuthState>(...);
export function useAuth() { ... }
```

### Rule 6: Accessible interactive elements

```tsx
// ✅ Always add aria-label to icon-only buttons
<button aria-label="Close modal" onClick={onClose}>
  <X className="w-5 h-5" />
</button>

// ✅ Use semantic HTML
<nav> instead of <div role="navigation">
<main> instead of <div id="main-content">
<button> instead of <div onClick={...}>
```

---

## 7. Page Creation Rules

### Creating a new dashboard page

**Step 1**: Create the page file:

```bash
mkdir -p app/(dashboard)/analytics
touch app/(dashboard)/analytics/page.tsx
```

**Step 2**: Write the page component:

```tsx
// app/(dashboard)/analytics/page.tsx

// If no client-side interactivity needed, skip "use client"
export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Your coding performance over time" />
      {/* Page content */}
    </div>
  );
}
```

**Step 3**: Add to sidebar navigation (`constants/navigation.ts`):

```ts
import { BarChart2 } from "lucide-react";

export const SIDEBAR_MENU_ITEMS = [
  // ... existing items
  { name: "Analytics", icon: BarChart2, badge: null, href: "/analytics" },
];
```

**Step 4**: *(Optional)* Add a loading state:

```tsx
// app/(dashboard)/analytics/loading.tsx
export default function AnalyticsLoading() {
  return <div>Loading analytics...</div>;
}
```

**Step 5**: The page automatically:
- Gets `DashboardLayout` (Sidebar + Navbar)
- Gets dark/light theme support
- Gets the correct sidebar active state
- Is middleware-protected (add to matcher if needed)

### Page content structure

```tsx
export default function MyPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Page Title</h1>
        <p className="text-text-secondary text-sm mt-1">Page description</p>
      </div>

      {/* Page sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cards, tables, charts */}
      </section>
    </div>
  );
}
```

---

## 8. Styling Conventions

### Use semantic theme tokens first

```tsx
// ✅ Preferred: semantic tokens (theme-adaptive)
<div className="bg-card-bg border border-border-card text-text-primary">

// ⚠️ Use sparingly: raw colors (theme-breaking if used on adaptive surfaces)
<div className="bg-[#0b0f17] text-white">

// ✅ Fine: brand colors (theme-invariant)
<div className="bg-brand-orange text-white">
```

### Spacing scale reference

Use Tailwind's spacing scale consistently:

| Space | Value | Use case |
|---|---|---|
| `gap-4` / `p-4` | 16px | Small card padding, grid gaps |
| `gap-5` / `p-5` | 20px | Medium spacing |
| `gap-6` / `p-6` | 24px | Standard card padding, section gaps |
| `gap-8` / `p-8` | 32px | Main content padding (`<main>`) |
| `space-y-6` | 24px | Vertical stacking of sections |

The `<main>` element in `DashboardLayout` uses `px-8 py-6` — respect these gutters.

### Border radius scale

From `constants/theme.ts`:

| Token | Tailwind | Use case |
|---|---|---|
| `THEME_RADIUS.card` | `rounded-[24px]` | Main dashboard cards |
| `THEME_RADIUS.statCard` | `rounded-[20px]` | Stat cards |
| `THEME_RADIUS.button` | `rounded-xl` | Buttons and inputs |
| `THEME_RADIUS.badge` | `rounded-lg` | Tags and badges |

### Transitions

Always add transitions to interactive elements:

```tsx
// ✅ Standard: smooth 300ms on all properties
<button className="transition-all duration-300 hover:bg-brand-orange/10">

// ✅ Fast: 150ms for micro-interactions
<span className="transition-all duration-150 hover:text-brand-orange">
```

### Avoid `!important` and arbitrary z-indices

Use the `THEME_Z_INDEX` constants:

```ts
THEME_Z_INDEX.backdrop       // z-40
THEME_Z_INDEX.sidebarDrawer  // z-50
THEME_Z_INDEX.navbar         // z-20
THEME_Z_INDEX.floatingElement // z-30
```

---

## 9. TypeScript Conventions

### Always type component props

```tsx
// ✅ Always define a typed interface
interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
```

### Use generic Zustand selectors

```tsx
// ✅ Efficient: only re-renders when showToast changes
const showToast = useNotificationStore((s) => s.showToast);

// ⚠️ Less efficient: re-renders on any state change
const store = useNotificationStore();
```

### Never use `any` — use `unknown` and narrow

```tsx
// ❌ Never
catch (err: any) { console.log(err.message); }

// ✅ Always narrow with type guard
catch (err: unknown) {
  const message = handleApiError(err); // handleApiError accepts unknown
}
```

---

## 10. Responsive UI Rules

### Breakpoints

TailwindCSS v4 default breakpoints:

| Prefix | Min width | Device target |
|---|---|---|
| *(none)* | 0px | Mobile (default/smallest) |
| `sm:` | 640px | Large mobile |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Laptop |
| `xl:` | 1280px | Desktop |
| `2xl:` | 1536px | Wide desktop |

### Mobile-first rule

Always write styles for mobile first, then override for larger screens:

```tsx
// ✅ Correct: mobile-first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// ❌ Wrong: desktop-first (harder to override on mobile)
<div className="grid grid-cols-3 gap-6">
```

### Sidebar responsive behavior

```tsx
// Sidebar is hidden on mobile, visible on desktop (md+)
// Mobile: slide-over drawer (fixed, full height, translate-based)
// Desktop: part of the flex layout (relative, always visible)

// Code pattern in DashboardLayout.tsx:
className={`
  fixed md:relative z-50 md:z-auto h-full
  ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
`}
```

### Content max-width

Use `THEME_SPACING.contentMaxWidth` (1300px) for content containers:

```tsx
<div className="max-w-[1300px] mx-auto">
  {children}
</div>
```

---

## 11. Theme-Safe Coding Rules

1. **Use `bg-bg-page` not `bg-white` or `bg-gray-950`** for page backgrounds
2. **Use `text-text-primary` not `text-black` or `text-white`** for primary text
3. **Use `bg-card-bg` not `bg-white/90`** for card surfaces
4. **Use `border-border-card` not `border-gray-200`** for card borders
5. **Always add the `mounted` guard** before reading `useTheme()`
6. **Never use `rgba(255,255,255,x)` as text color** — invisible in light mode; use `text-text-secondary` or `text-text-muted`
7. **Never use `rgba(0,0,0,x)` as text color** — invisible in dark mode
8. **Test every new component in both themes** by clicking the ThemeToggle

---

## 12. UI Safety & Stability Guide

### Preventing Hydration Mismatches

**What it is**: React renders HTML on the server; the client rehydrates it. If server and client output differ, React throws a hydration error.

**Common causes & fixes**:

```tsx
// ❌ Cause: Reading localStorage on server
const collapsed = localStorage.getItem("sidebar-collapsed"); // throws on server

// ✅ Fix: Guard with typeof window
const collapsed = typeof window !== "undefined"
  ? localStorage.getItem("sidebar-collapsed")
  : null;
```

```tsx
// ❌ Cause: useTheme() before mount returns undefined
const { theme } = useTheme();
const bg = theme === "dark" ? "..." : "..."; // undefined comparison

// ✅ Fix: mounted guard
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

```tsx
// ❌ Cause: <html> class mismatch (theme class)
// ✅ Fix: suppressHydrationWarning on <html> (already done in app/layout.tsx)
<html suppressHydrationWarning>
```

### Preventing Layout Overflow

The dashboard uses `h-screen overflow-hidden` on the root container. Only `<main>` scrolls.

```tsx
// ✅ Correct: overflow contained in <main>
<div className="flex h-screen overflow-hidden">
  <Sidebar />
  <div className="flex-1 flex flex-col overflow-hidden">
    <Navbar />
    <main className="flex-1 overflow-y-auto">  {/* ← only this scrolls */}
      {children}
    </main>
  </div>
</div>

// ❌ Wrong: adding overflow to sidebar causes double scrollbar
<aside className="h-full overflow-y-auto"> {/* ← don't do this */}
```

### Preventing Tailwind Class Conflicts

Always use `cn()` when combining dynamic and static classes:

```tsx
// ✅ tailwind-merge resolves conflicts
cn("px-4 py-2", isLarge && "px-8") // → "py-2 px-8" (px-4 removed)

// ❌ Both px values conflict
`px-4 py-2 ${isLarge ? "px-8" : ""}`  // → "px-4 py-2 px-8" (undefined behavior)
```

### Preventing Sidebar Scroll Issues

The sidebar has a fixed height (`h-screen`) and uses `justify-between` to pin the bottom section. If content overflows:

1. Check if a new bottom card is taller than the available space
2. Use `overflow-hidden` + height/opacity animation to expand content (as used in the Streak Card collapse)
3. Never use `overflow-y-auto` in the sidebar — it creates a nested scroll inside the global scroll

### Preventing Broken Reusable Components

When extending a UI component:

```tsx
// ✅ Always spread className to allow caller customization
export default function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn("base-button-styles", className)} // ← className last (highest priority)
      {...props}
    />
  );
}

// ❌ Ignoring className breaks customization
export default function Button({ children }: ButtonProps) {
  return <button className="base-button-styles">{children}</button>;
}
```

---

## 13. Debugging Guide

### Debugging theme issues

1. Open DevTools → Elements → inspect `<html>` class attribute
2. Should show `dark` in dark mode, nothing (or `light`) in light mode
3. If ThemeToggle doesn't switch: check `mounted` state guard in `ThemeToggle.tsx`
4. If theme flashes on load: verify `suppressHydrationWarning` on `<html>` in `app/layout.tsx`

### Debugging sidebar state

```tsx
// Add temporary debug output
const { isSidebarCollapsed, isMobileSidebarOpen } = useDashboard();
console.log({ isSidebarCollapsed, isMobileSidebarOpen });
```

Check `localStorage.getItem("sidebar-collapsed")` in browser DevTools → Application → Local Storage.

### Debugging Zustand stores

Install Zustand devtools (future enhancement):

```ts
import { devtools } from "zustand/middleware";

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({ ... }), { name: "AuthStore" })
);
```

Then inspect in Redux DevTools browser extension.

### Debugging API calls

In development, check the Network tab in browser DevTools:
- Filter by `Fetch/XHR`
- Look for calls to your `NEXT_PUBLIC_API_BASE_URL`
- Check request headers, body, and response status

### Debugging TypeScript errors

```bash
# Run type-check without building
npx tsc --noEmit

# Check a specific file
npx tsc --noEmit app/(dashboard)/problems/page.tsx
```

### Common error messages

| Error | Cause | Fix |
|---|---|---|
| `useTheme must be used within ThemeProvider` | Component is outside `ThemeProvider` | Check provider nesting in `app/layout.tsx` |
| `useDashboard must be used within DashboardProvider` | `useDashboard()` called outside dashboard layout | Only use in `(dashboard)` route children |
| `Hydration failed because the server rendered HTML didn't match the client` | Theme-reading before mount | Add `mounted` guard |
| `window is not defined` | Browser API called on server | Add `typeof window !== "undefined"` guard |
