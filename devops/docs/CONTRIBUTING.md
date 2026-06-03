# Contributing to FullPrep

> **Welcome!** This guide helps new teammates quickly understand the codebase and contribute effectively.

---

## Table of Contents

1. [Before You Start](#1-before-you-start)
2. [Understanding the Architecture](#2-understanding-the-architecture)
3. [Setting Up Your Environment](#3-setting-up-your-environment)
4. [Git Workflow](#4-git-workflow)
5. [Adding a New Page](#5-adding-a-new-page)
6. [Adding a Reusable Component](#6-adding-a-reusable-component)
7. [Integrating a New API Endpoint](#7-integrating-a-new-api-endpoint)
8. [Maintaining Theme Consistency](#8-maintaining-theme-consistency)
9. [Debugging Layout Issues](#9-debugging-layout-issues)
10. [Safely Extending the Platform](#10-safely-extending-the-platform)
11. [Code Review Checklist](#11-code-review-checklist)
12. [Communication & Standards](#12-communication--standards)

---

## 1. Before You Start

Read these documents in order:

| Order | Document | Time |
|---|---|---|
| 1 | [README.md](./README.md) | 5 min |
| 2 | [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) | 15 min |
| 3 | [ROUTING_SYSTEM.md](./ROUTING_SYSTEM.md) | 10 min |
| 4 | [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) | 10 min |
| 5 | [THEME_SYSTEM.md](./THEME_SYSTEM.md) | 10 min |
| 6 | [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) | 15 min |
| 7 | [API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md) | 10 min |

**First task**: Run the project locally and navigate through all dashboard pages. Observe:
- How the sidebar active state tracks the current route
- How the theme toggle switches the entire UI
- How the sidebar collapses and expands
- How the Monaco editor works on a problem page

---

## 2. Understanding the Architecture

### The 30-second mental model

```
User visits /problems/two-sum
    ↓
Next.js routes to: app/(dashboard)/problems/[slug]/page.tsx
    ↓
Dashboard layout wraps it: app/(dashboard)/layout.tsx
    ↓
DashboardLayout renders: Sidebar + Navbar + <main>
    ↓
The page renders inside <main>
    ↓
State lives in Zustand stores (authStore, editorStore, etc.)
    ↓
API calls go through: Service → api.ts → fetcher.ts → Express backend
    ↓
Styles use: Tailwind utilities mapped to CSS variables from globals.css
```

### The 3 questions to ask when adding anything

1. **Is this a new page or a component?**
   - New page → `app/(dashboard)/new-route/page.tsx`
   - New component → `components/category/ComponentName.tsx`

2. **Does it need global state?**
   - Yes → Add a Zustand store or extend an existing one
   - No → Use local `useState`

3. **Does it need an API call?**
   - Yes → Add a method to the appropriate `services/*.service.ts` file
   - No → Use mock data from `mocks/`

---

## 3. Setting Up Your Environment

```bash
# Fork and clone
git clone https://github.com/your-username/fullprep.git
cd fullprep

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in NEXT_PUBLIC_API_BASE_URL

# Start development server
npm run dev
```

### Recommended VS Code extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag"
  ]
}
```

---

## 4. Git Workflow

### Branch naming

```
feature/add-analytics-page
fix/sidebar-overflow-mobile
refactor/editor-store-settings
docs/update-api-guide
```

### Commit format

Use conventional commits:

```
feat: add analytics page with recharts heatmap
fix: resolve sidebar overflow on ai-hints page
refactor: extract problem slug utility to lib/utils
docs: add state management documentation
style: adjust stat card border radius to match design system
```

### Before opening a PR

```bash
# Run these commands and fix any issues
npm run lint        # Fix all ESLint errors
npm run build       # Ensure no TypeScript errors, build succeeds
```

---

## 5. Adding a New Page

### Complete walkthrough: adding a `/contests/[id]` dynamic page

**Step 1**: Create the page file

```
app/
└── (dashboard)/
    └── contests/
        ├── page.tsx          ← Already exists (contests list)
        └── [id]/
            └── page.tsx      ← CREATE THIS
```

```tsx
// app/(dashboard)/contests/[id]/page.tsx

interface ContestPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContestDetailPage({ params }: ContestPageProps) {
  const { id } = await params;  // ← params is a Promise in Next.js 16

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Contest #{id}</h1>
      {/* Contest detail content */}
    </div>
  );
}
```

**Step 2**: Add a service method (if needed)

```ts
// services/contests.service.ts

export const ContestsService = {
  async getContestById(id: string): Promise<Contest> {
    return CONTESTS_MOCK.find((c) => c.id === id)!;
    // Real: return api.get<Contest>(`${BASE_URL}/contests/${id}`);
  },
};
```

**Step 3**: *(Optional)* Add a loading state

```tsx
// app/(dashboard)/contests/[id]/loading.tsx
export default function ContestLoading() {
  return <Skeleton className="h-48 rounded-2xl" />;
}
```

The page is now live at `/contests/some-contest-id`. No other files need to change.

---

## 6. Adding a Reusable Component

### Complete walkthrough: adding a `<TimeRemainingBadge>` component

**Step 1**: Identify the category. This is a small UI element → `components/ui/`

**Step 2**: Create the file with typed props

```tsx
// components/ui/TimeRemainingBadge.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface TimeRemainingBadgeProps {
  seconds: number;       // Seconds remaining
  className?: string;    // Always accept className for flexibility
}

export default function TimeRemainingBadge({ seconds, className }: TimeRemainingBadgeProps) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const isUrgent = seconds < 300; // Less than 5 minutes

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border",
      isUrgent
        ? "bg-red-500/10 border-red-500/30 text-red-400"
        : "bg-card-bg border-border-card text-text-secondary",
      className
    )}>
      <Clock className="w-3.5 h-3.5" />
      <span>{hours}h {minutes}m remaining</span>
    </div>
  );
}
```

**Step 3**: Use in any page or component

```tsx
import TimeRemainingBadge from "@/components/ui/TimeRemainingBadge";

<TimeRemainingBadge seconds={contest.remainingSeconds} className="mt-2" />
```

**Checklist for new components**:
- [ ] TypeScript interface defined for all props
- [ ] `className` prop accepted and applied via `cn()`
- [ ] Theme-safe colors (uses `text-text-primary`, `bg-card-bg`, etc.)
- [ ] Tested in both dark and light mode
- [ ] `"use client"` only added if actually needed

---

## 7. Integrating a New API Endpoint

### Walkthrough: connecting `/api/contests` to the contests page

**Step 1**: Define the TypeScript type

```ts
// types/contests.ts
export interface Contest {
  id: string;
  title: string;
  startTime: string;     // ISO date string
  endTime: string;
  status: "upcoming" | "live" | "ended";
  participants: number;
}
```

**Step 2**: Update the service file

```ts
// services/contests.service.ts
import { api } from "@/lib/api";
import { Contest } from "@/types/contests";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ContestsService = {
  async getContests(): Promise<Contest[]> {
    return api.get<Contest[]>(`${BASE}/contests`);
    // Previously returned mock data — now hits real API
  },
};
```

**Step 3**: Handle loading and error in the page

```tsx
// app/(dashboard)/contests/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ContestsService } from "@/services/contests.service";
import { handleApiError } from "@/lib/error-handler";
import { Contest } from "@/types/contests";
import Skeleton from "@/components/ui/Skeleton";

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ContestsService.getContests()
      .then(setContests)
      .catch((err) => setError(handleApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-64 rounded-2xl" />;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div>
      {contests.map((c) => <ContestCard key={c.id} contest={c} />)}
    </div>
  );
}
```

**Zero changes required in**: routing, layout, theme, stores, or other pages.

---

## 8. Maintaining Theme Consistency

### Quick rules

| DO | DON'T |
|---|---|
| `text-text-primary` | `text-black` or `text-white` |
| `bg-card-bg` | `bg-white` or `bg-gray-900` |
| `border-border-card` | `border-gray-200` |
| `text-text-secondary` | `text-gray-500` or `rgba(255,255,255,0.6)` |
| Test both themes before PR | Submit untested for both themes |

### How to test theme consistency

1. Run `npm run dev`
2. Navigate to your new page
3. Click the ThemeToggle in the Navbar
4. Verify:
   - All text is readable
   - Card backgrounds are visible
   - Borders are visible
   - No hardcoded dark or light colors bleeding through

### Common theme bugs

**Bug**: White text on white card in light mode
```tsx
// ❌ Cause
<p className="text-white">Text</p>

// ✅ Fix
<p className="text-text-primary">Text</p>
```

**Bug**: Dark background card in light mode
```tsx
// ❌ Cause
<div className="bg-[#0b0f17]">Card</div>

// ✅ Fix
<div className="bg-card-bg">Card</div>
```

---

## 9. Debugging Layout Issues

### Overflow issues

If content overflows outside the viewport:

1. Open DevTools → Elements
2. Select the overflowing element
3. Check if `overflow: visible` is set on a container that should be `overflow: hidden`
4. Verify `<main>` has `overflow-y-auto` (not the parent containers)

### Sidebar layout bugs

If the sidebar pushes content off-screen:

```tsx
// Verify DashboardLayout structure
<div className="flex w-full h-screen overflow-hidden">
  <div className={`${isSidebarCollapsed ? "w-[80px]" : "w-[270px]"} shrink-0`}>
    <Sidebar />
  </div>
  <div className="flex-1 min-w-0">  {/* min-w-0 is critical! */}
    <Navbar />
    <main className="flex-1 overflow-y-auto">
      {children}
    </main>
  </div>
</div>
```

`min-w-0` on the content column prevents flex overflow — without it, wide content can expand the column beyond the viewport.

### Z-index conflicts

Use the constants:

```ts
// constants/theme.ts
THEME_Z_INDEX.backdrop       // z-40
THEME_Z_INDEX.sidebarDrawer  // z-50
THEME_Z_INDEX.navbar         // z-20
THEME_Z_INDEX.floatingElement // z-30
```

Never invent new z-index values. If you need a new layer, add it to `THEME_Z_INDEX`.

---

## 10. Safely Extending the Platform

### Adding features to Sidebar

The Sidebar is sensitive — it has specific logic for:
- Collapsed/expanded states
- Mobile drawer behavior
- Route-based card swapping (`/ai-hints` vs other routes)
- Mini profile popover positioning

**Rules when modifying Sidebar**:
1. Test on both mobile (< 768px) and desktop (≥ 768px)
2. Test in collapsed AND expanded mode
3. Verify the `/ai-hints` path still renders the Upgrade card
4. Verify the streak card still collapses properly
5. Verify the mini popover positions correctly in both modes

### Adding to the Navbar

Navbar items appear on every dashboard page. Be conservative — only add truly global actions (search, notifications, settings toggle, theme toggle).

### Adding new Zustand stores

Follow the pattern from existing stores:

```ts
// store/myNewStore.ts
import { create } from "zustand";

interface MyNewState {
  // 1. State properties
  items: string[];

  // 2. Actions
  addItem: (item: string) => void;
  removeItem: (item: string) => void;
  clearItems: () => void;
}

export const useMyNewStore = create<MyNewState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (item) => set((state) => ({ items: state.items.filter((i) => i !== item) })),
  clearItems: () => set({ items: [] }),
}));
```

---

## 11. Code Review Checklist

Use this before requesting a review:

### Code quality

- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] No ESLint warnings (`npm run lint` passes)
- [ ] No `console.log` statements left in code
- [ ] No `any` types used
- [ ] No hardcoded user data (usernames, emails)

### UI / UX

- [ ] Component works in dark mode
- [ ] Component works in light mode
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on desktop (≥ 1024px)
- [ ] Theme toggle doesn't break the component
- [ ] No hydration warnings in console

### Architecture

- [ ] No `fetch()` called directly in components (use services)
- [ ] No business logic in `components/ui/` primitives
- [ ] `"use client"` added only where actually needed
- [ ] New pages added to sidebar navigation (if user-facing)
- [ ] `className` prop accepted in all UI components

### Performance

- [ ] No unnecessary `useEffect` re-runs (check dependency arrays)
- [ ] Large components use selective Zustand subscription, not full store
- [ ] Images are optimized (use `next/image` for any images)

---

## 12. Communication & Standards

### Opening a PR

Use this PR template:

```markdown
## Summary
Brief description of what this PR does.

## Changes
- [ ] New component: `components/ui/XYZ.tsx`
- [ ] New page: `app/(dashboard)/xyz/page.tsx`
- [ ] Updated service: `services/xyz.service.ts`

## Testing
- [ ] Tested in dark mode
- [ ] Tested in light mode
- [ ] Tested on mobile
- [ ] `npm run build` passes

## Screenshots
(Attach before/after screenshots for UI changes)
```

### Getting help

If you're stuck:
1. Read the relevant documentation file first
2. Check if a similar pattern already exists in the codebase (e.g., how does `Sidebar.tsx` handle collapsed state?)
3. Open a discussion in the project's communication channel with:
   - What you're trying to do
   - What you've tried
   - The exact error message (if any)

---

*Happy coding! The codebase is built to be extended — follow the patterns, respect the theme system, and the platform will stay maintainable as it grows.* 🚀
