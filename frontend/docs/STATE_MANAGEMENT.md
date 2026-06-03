# FullPrep — State Management

> **Reference**: Zustand stores, Context API, state flow patterns, and persistence strategy.

---

## Table of Contents

1. [Why Zustand](#1-why-zustand)
2. [State Architecture Overview](#2-state-architecture-overview)
3. [authStore](#3-authstore)
4. [sidebarStore](#4-sidebarstore)
5. [editorStore](#5-editorstore)
6. [notificationStore](#6-notificationstore)
7. [themeStore](#7-themestore)
8. [DashboardContext (Context API Bridge)](#8-dashboardcontext-context-api-bridge)
9. [Store Interaction Patterns](#9-store-interaction-patterns)
10. [Persistence Strategy](#10-persistence-strategy)
11. [Scalability Guide](#11-scalability-guide)

---

## 1. Why Zustand

Zustand was chosen as the global state management solution for the following reasons:

| Criterion | Zustand | Redux | Context API alone |
|---|---|---|---|
| **Boilerplate** | Minimal | Heavy | None |
| **TypeScript** | Native | Via RTK | Native |
| **Devtools** | Yes (middleware) | Yes | Limited |
| **Performance** | Excellent (subscription model) | Good | Re-renders on any change |
| **Bundle size** | ~1kb | ~16kb (RTK) | 0 (built-in) |
| **Async actions** | Direct in actions | Requires thunk/saga | Manual |
| **Persistence** | Easy (middleware or manual) | Possible | Manual |

**For a project of FullPrep's scale** (10–20 global state slices), Zustand provides the right balance of power and simplicity. Redux would introduce unnecessary infrastructure. Pure Context API would cause excessive re-renders as the state grows.

---

## 2. State Architecture Overview

```
┌───────────────────────────────────────────────────────┐
│                   Global State Layer                  │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ authStore   │  │ sidebarStore │  │ editorStore │  │
│  │ (Zustand)   │  │ (Zustand)    │  │ (Zustand)   │  │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘  │
│         │                │                 │          │
│  ┌──────┴──────┐  ┌──────┴──────┐          │          │
│  │notification │  │  themeStore │          │          │
│  │  Store      │  │  (Zustand)  │          │          │
│  └─────────────┘  └─────────────┘          │          │
└───────────────────────────────────────────────────────┘
                                             │
┌──────────────────────────────────────────────────────┐
│               Layout-Scoped Layer                    │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  DashboardContext (Context API)                │  │
│  │  Bridges: sidebarStore + next-themes           │  │
│  │  Exposes: useDashboard() hook                  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Access pattern**:

```tsx
// Direct Zustand access (anywhere in app)
const { user } = useAuthStore();
const showToast = useNotificationStore((s) => s.showToast);

// Context bridge (dashboard layout components only)
const { isSidebarCollapsed, theme } = useDashboard();
```

---

## 3. `authStore`

**File**: `store/authStore.ts`

**Purpose**: Manages user authentication state and user profile data.

### Interface

```ts
interface UserProfile {
  name: string;
  email: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string }) => void;
  logout: () => void;
}
```

### Default State

```ts
{
  user: { name: "Khushi", email: "khushi.dev" },
  isAuthenticated: true,
}
```

> **Note**: The store ships with a pre-authenticated mock user for development. In production, initialize with `{ user: null, isAuthenticated: false }` and call `login()` after successful JWT verification.

### Actions

| Action | Description |
|---|---|
| `login({ email })` | Sets user from email, marks authenticated |
| `logout()` | Clears user, marks unauthenticated |

### Usage Example

```tsx
import { useAuthStore } from "@/store/authStore";

// In a component
const { user, isAuthenticated, login, logout } = useAuthStore();

// Login
login({ email: "khushi@fullprep.dev" });

// Logout
logout();
```

### Hook abstraction

Use the `useAuth()` hook from `hooks/useAuth.ts` for a cleaner interface:

```tsx
import { useAuth } from "@/hooks/useAuth";

const { user, isAuthenticated, login, logout } = useAuth();
```

### Future: Full User Profile

When the backend is connected, expand `UserProfile`:

```ts
interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "Free" | "Pro";
  avatar?: string;
  rating: number;
  solvedCount: number;
  streak: number;
}
```

---

## 4. `sidebarStore`

**File**: `store/sidebarStore.ts`

**Purpose**: Manages sidebar UI state — collapse, mobile drawer, and notification badge count.

### Interface

```ts
interface SidebarState {
  isSidebarCollapsed: boolean;
  isMobileSidebarOpen: boolean;
  notificationCount: number;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  clearNotifications: () => void;
}
```

### Default State

```ts
{
  isSidebarCollapsed: false,
  isMobileSidebarOpen: false,
  notificationCount: 1,
}
```

### Persistence

`setIsSidebarCollapsed` writes the value to `localStorage`:

```ts
setIsSidebarCollapsed: (collapsed) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }
  set({ isSidebarCollapsed: collapsed });
}
```

On mount, `DashboardContext` reads `localStorage` and restores the saved collapse state.

### Actions

| Action | Description |
|---|---|
| `setIsSidebarCollapsed(bool)` | Collapse/expand sidebar, saves to localStorage |
| `setIsMobileSidebarOpen(bool)` | Open/close mobile slide-over drawer |
| `clearNotifications()` | Reset notification count to 0 |

### Usage

```tsx
// In DashboardLayout
const { isSidebarCollapsed, setIsMobileSidebarOpen } = useDashboard();

// In Navbar collapse toggle
setIsSidebarCollapsed(!isSidebarCollapsed);
```

---

## 5. `editorStore`

**File**: `store/editorStore.ts`

**Purpose**: Manages Monaco editor configuration settings, language selection, fullscreen state, and active output tab.

### Interface

```ts
export interface EditorSettings {
  fontSize: number;          // 14
  theme: string;             // "vs-dark"
  wordWrap: "on" | "off";    // "on"
  minimap: boolean;          // true
  lineNumbers: "on" | "off"; // "on"
  tabSize: number;           // 4
}

interface EditorState {
  settings: EditorSettings;
  isFullscreen: boolean;
  activeTab: "testcase" | "result" | "console";
  language: string;
  updateSetting: <K extends keyof EditorSettings>(key: K, value: EditorSettings[K]) => void;
  setIsFullscreen: (full: boolean) => void;
  setActiveTab: (tab: "testcase" | "result" | "console") => void;
  setLanguage: (lang: string) => void;
}
```

### Default Settings

```ts
{
  settings: {
    fontSize: 14,
    theme: "vs-dark",
    wordWrap: "on",
    minimap: true,
    lineNumbers: "on",
    tabSize: 4,
  },
  isFullscreen: false,
  activeTab: "testcase",
  language: "javascript",
}
```

### Actions

| Action | Description |
|---|---|
| `updateSetting(key, value)` | Partial-update a single editor setting |
| `setIsFullscreen(bool)` | Toggle fullscreen editor mode |
| `setActiveTab(tab)` | Switch active output console tab |
| `setLanguage(lang)` | Change programming language |

### Usage Example

```tsx
import { useEditorStore } from "@/store/editorStore";

const { settings, language, updateSetting, setLanguage } = useEditorStore();

// Change font size
updateSetting("fontSize", 16);

// Change language
setLanguage("python");
```

### Connecting to MonacoEditor

```tsx
const { settings, language } = useEditorStore();

<MonacoEditor
  language={language}
  theme={settings.theme}
  fontSize={settings.fontSize}
  minimapEnabled={settings.minimap}
  lineNumbers={settings.lineNumbers}
  wordWrap={settings.wordWrap}
  tabSize={settings.tabSize}
  value={code}
  onChange={setCode}
/>
```

---

## 6. `notificationStore`

**File**: `store/notificationStore.ts`

**Purpose**: Manages application-wide toast notification state with auto-dismiss.

### Interface

```ts
interface ToastNotification {
  show: boolean;
  message: string;
  type: "success" | "info";
}

interface NotificationState {
  toast: ToastNotification;
  showToast: (message: string, type?: "success" | "info") => void;
  hideToast: () => void;
}
```

### Auto-dismiss Implementation

The store uses a `timeoutId` in closure scope to implement auto-dismiss:

```ts
export const useNotificationStore = create<NotificationState>((set) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return {
    showToast: (message, type = "success") => {
      if (timeoutId) clearTimeout(timeoutId); // Cancel any pending dismiss
      set({ toast: { show: true, message, type } });
      timeoutId = setTimeout(() => {
        set({ toast: { show: false, message: "", type } });
      }, 2500); // Auto-dismiss after 2.5 seconds
    },
    hideToast: () => {
      if (timeoutId) clearTimeout(timeoutId);
      set((state) => ({ toast: { ...state.toast, show: false } }));
    },
  };
});
```

**Key behavior**: If a second toast is triggered before the first auto-dismisses, the previous timeout is cancelled and reset. This prevents "phantom dismissals" of newer toasts.

### Usage

```tsx
import { useNotificationStore } from "@/store/notificationStore";

const showToast = useNotificationStore((s) => s.showToast);

// Show a success toast
showToast("Problem bookmarked!", "success");

// Show an info toast
showToast("Connecting to server...", "info");
```

### Subscribing to toast state (in a Toast UI component)

```tsx
const { toast, hideToast } = useNotificationStore();

// Render conditionally
{toast.show && (
  <div className={`toast toast-${toast.type}`}>
    {toast.message}
    <button onClick={hideToast}>×</button>
  </div>
)}
```

---

## 7. `themeStore`

**File**: `store/themeStore.ts`

**Purpose**: Supplemental Zustand store to sync/track theme name. Primarily a utility store.

### Interface

```ts
interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}
```

> **Note**: The primary theme system is powered by `next-themes` via `ThemeProvider`. This store exists for components that need to read the theme name in a Zustand-native way or for cross-store theme coordination. The canonical source of truth for theme is `useTheme()` from `next-themes`.

---

## 8. DashboardContext (Context API Bridge)

**File**: `store/DashboardContext.tsx`

**Purpose**: Bridges `next-themes` (an external context-based system) with `useSidebarStore` (Zustand), exposing both through a single unified hook.

### Why Context here?

Zustand cannot directly call React hooks from other libraries. `next-themes` exposes its API only via `useTheme()` (a React hook). To combine both into a single interface for layout components, we use React Context as a composition layer.

```tsx
export function DashboardProvider({ children }) {
  const { theme, setTheme } = useTheme();          // from next-themes
  const sidebar = useSidebarStore();                 // from Zustand

  // localStorage restoration on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed") === "true";
    if (saved) sidebar.setIsSidebarCollapsed(true);
  }, []);

  return (
    <DashboardContext.Provider value={{
      theme: theme || "light",
      setTheme,
      isSidebarCollapsed: sidebar.isSidebarCollapsed,
      setIsSidebarCollapsed: sidebar.setIsSidebarCollapsed,
      isMobileSidebarOpen: sidebar.isMobileSidebarOpen,
      setIsMobileSidebarOpen: sidebar.setIsMobileSidebarOpen,
      notificationCount: sidebar.notificationCount,
      clearNotifications: sidebar.clearNotifications,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}
```

### useDashboard() hook

```tsx
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
```

The guard ensures this hook is only used inside the dashboard layout tree. If called outside, it throws immediately with a clear error message.

---

## 9. Store Interaction Patterns

### Pattern 1: Selective subscription (performance)

Only subscribe to the piece of state you need. Zustand re-renders the component only when the subscribed value changes.

```tsx
// ✅ Efficient: re-renders only when showToast changes (never)
const showToast = useNotificationStore((s) => s.showToast);

// ❌ Less efficient: re-renders on any toast state change
const { showToast, toast, hideToast } = useNotificationStore();
```

### Pattern 2: Cross-store coordination

Stores are independent — they communicate via component logic, not direct store-to-store calls.

```tsx
// Logout flow: coordinates authStore + notificationStore + routing
const { logout } = useAuth();
const showToast = useNotificationStore((s) => s.showToast);
const router = useRouter();

const handleLogout = () => {
  logout();                             // authStore
  showToast("Signed out.", "success");  // notificationStore
  router.push("/login");                // Next.js router
};
```

### Pattern 3: Derived state in component

Don't store derived values in Zustand. Compute them in the component:

```tsx
// ✅ Correct: derive from store state in component
const { user } = useAuthStore();
const userInitials = user?.name.charAt(0).toUpperCase() ?? "?";

// ❌ Incorrect: storing derived state in Zustand
// userInitials: string; ← Don't do this
```

---

## 10. Persistence Strategy

| Store | Persistence | Mechanism |
|---|---|---|
| `authStore` | Session (in-memory) | Lost on refresh — connect to JWT on backend |
| `sidebarStore` | `localStorage` | Sidebar collapse preference persists across sessions |
| `editorStore` | Session (in-memory) | Planned: persist to `localStorage` per problem |
| `notificationStore` | None | Ephemeral — toasts should not persist |
| `themeStore` | Via `next-themes` | Theme is persisted by `next-themes` in `localStorage` |

### Future: Zustand persist middleware

To persist stores across page refreshes:

```ts
import { persist } from "zustand/middleware";

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({ /* state */ }),
    { name: "editor-settings" } // localStorage key
  )
);
```

---

## 11. Scalability Guide

### Adding a New Store

1. Create `store/myFeatureStore.ts`:

```ts
import { create } from "zustand";

interface MyFeatureState {
  data: string[];
  addItem: (item: string) => void;
  clearItems: () => void;
}

export const useMyFeatureStore = create<MyFeatureState>((set) => ({
  data: [],
  addItem: (item) => set((state) => ({ data: [...state.data, item] })),
  clearItems: () => set({ data: [] }),
}));
```

2. Use it in any component:

```tsx
const { data, addItem } = useMyFeatureStore();
```

3. If it needs to be exposed via `useDashboard()`, add it to `DashboardContext.tsx`.

### Store Naming Convention

| Pattern | Example |
|---|---|
| Store file | `featureStore.ts` |
| Export name | `useFeatureStore` |
| State interface | `FeatureState` |
| Actions naming | `setX`, `addX`, `clearX`, `removeX` |
