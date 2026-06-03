# FullPrep — Theme System

> **Reference**: Dark/light mode architecture, CSS variable tokens, glassmorphism patterns, and safe component theming.

---

## Table of Contents

1. [Theme System Overview](#1-theme-system-overview)
2. [How Themes Are Applied](#2-how-themes-are-applied)
3. [CSS Variable Token System](#3-css-variable-token-system)
4. [Tailwind Theme Extension](#4-tailwind-theme-extension)
5. [ThemeProvider Architecture](#5-themeprovider-architecture)
6. [ThemeToggle Component](#6-themetoggle-component)
7. [useTheme Hook (Mount-Safe)](#7-usetheme-hook-mount-safe)
8. [Glassmorphism System](#8-glassmorphism-system)
9. [Typography System](#9-typography-system)
10. [Sidebar Theme Locking](#10-sidebar-theme-locking)
11. [Building New Themed Components](#11-building-new-themed-components)
12. [Avoiding Theme Breakage](#12-avoiding-theme-breakage)
13. [Theme Constants Reference](#13-theme-constants-reference)

---

## 1. Theme System Overview

FullPrep implements a **CSS custom property–driven dual-theme system**. The architecture has three layers:

```
Layer 1: CSS Variables (globals.css)
         ← Defines semantic token values per theme

Layer 2: next-themes
         ← Applies .dark class to <html> based on user preference
         ← Persists preference to localStorage

Layer 3: TailwindCSS v4 @theme
         ← Maps CSS variable references to Tailwind utility class names
         ← Enables: bg-bg-page, text-text-primary, border-border-card, etc.
```

When the user switches to dark mode, `next-themes` adds `.dark` to `<html>`. The CSS variables in `.dark { }` override the `:root { }` values, and every component using semantic Tailwind classes instantly reflects the new theme — **no individual `dark:` variants needed on most elements**.

---

## 2. How Themes Are Applied

### Step 1 — HTML class changes

```html
<!-- Light mode -->
<html lang="en" class="h-full antialiased">

<!-- Dark mode (next-themes adds .dark) -->
<html lang="en" class="h-full antialiased dark">
```

### Step 2 — CSS variables switch

```css
:root {                          /* Light mode defaults */
  --background: #f5f7fb;
  --card-bg: rgba(255, 255, 255, 0.90);
  --text-primary: #111827;
}

.dark {                          /* Dark mode overrides */
  --background: #0b0f17;
  --card-bg: #0b1020;
  --text-primary: #ffffff;
}
```

### Step 3 — Tailwind utilities reflect the change

```css
/* @theme maps CSS vars to Tailwind utilities */
@theme {
  --color-bg-page: var(--background);       → bg-bg-page
  --color-card-bg: var(--card-bg);          → bg-card-bg
  --color-text-primary: var(--text-primary); → text-text-primary
}
```

### Step 4 — Components use semantic classes

```tsx
<div className="bg-bg-page text-text-primary border border-border-card">
  Content
</div>
```

This element automatically reflects both light and dark themes without any `dark:` conditional.

---

## 3. CSS Variable Token System

### Color Tokens

Defined in `app/globals.css`:

| Token | Light Value | Dark Value | Usage |
|---|---|---|---|
| `--background` | `#f5f7fb` | `#0b0f17` | Page background |
| `--card-bg` | `rgba(255,255,255,0.90)` | `#0b1020` | Card backgrounds |
| `--border-card` | `#e2e8f0` | `rgba(255,255,255,0.06)` | Card borders |
| `--text-primary` | `#111827` | `#ffffff` | Primary text |
| `--text-secondary` | `#64748b` | `rgba(255,255,255,0.60)` | Secondary text |
| `--text-muted` | `#94a3b8` | `rgba(255,255,255,0.40)` | Muted/disabled text |

### Brand Token (Theme-invariant)

```css
@theme {
  --color-brand-orange: #ff6a00;  /* Always #ff6a00 regardless of theme */
}
```

The brand orange never changes. It is the one color that provides visual consistency across both themes.

---

## 4. Tailwind Theme Extension

TailwindCSS v4 uses an `@theme` block in CSS (not `tailwind.config.js`) to extend the design system:

```css
@theme {
  --font-sans: var(--font-inter), system-ui, -apple-system, sans-serif;
  --color-brand-orange: #ff6a00;

  /* Semantic color utilities */
  --color-bg-page:        var(--background);
  --color-border-card:    var(--border-card);
  --color-text-primary:   var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted:     var(--text-muted);
  --color-card-bg:        var(--card-bg);
}
```

**Generated Tailwind utilities**:

```
bg-bg-page          → background-color: var(--background)
text-text-primary   → color: var(--text-primary)
text-text-secondary → color: var(--text-secondary)
text-text-muted     → color: var(--text-muted)
bg-card-bg          → background-color: var(--card-bg)
border-border-card  → border-color: var(--border-card)
bg-brand-orange     → background-color: #ff6a00
text-brand-orange   → color: #ff6a00
border-brand-orange → border-color: #ff6a00
```

### Dark mode variant

```css
@variant dark (&:where(.dark, .dark *));
```

This enables `dark:` prefix utilities in Tailwind that activate when the `.dark` class is on `<html>` or any ancestor. Useful for one-off overrides that don't have a CSS variable token.

---

## 5. ThemeProvider Architecture

**File**: `providers/ThemeProvider.tsx`

```tsx
<NextThemesProvider
  attribute="class"           // Apply theme via CSS class (not data-attribute)
  defaultTheme="dark"         // First visit defaults to dark mode
  enableSystem={false}        // Ignores OS color scheme preference
  {...props}
>
  <DashboardProvider>
    {children}
  </DashboardProvider>
</NextThemesProvider>
```

### Key decisions

| Option | Value | Reasoning |
|---|---|---|
| `attribute="class"` | class | TailwindCSS dark mode requires `.dark` class on HTML |
| `defaultTheme="dark"` | dark | Dark mode is the premium, primary FullPrep experience |
| `enableSystem={false}` | false | System preference is ignored — product makes the default decision |

### Hydration safety

```tsx
// In app/layout.tsx
<html suppressHydrationWarning>
```

`suppressHydrationWarning` prevents React from throwing a hydration error when `next-themes` adds the `.dark` class to `<html>` on the client. Without this, Next.js SSR renders `<html>` without the class, then the client adds it — causing a mismatch warning.

---

## 6. ThemeToggle Component

**File**: `components/ui/ThemeToggle.tsx`

The `ThemeToggle` is a custom sliding pill switch:

```
Light Mode:      [☀️ ●      ]
Dark Mode:       [      ● 🌙]
```

### Mount guard pattern

```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

const isDark = mounted ? theme === "dark" : true; // Default to dark before mount
```

**Why**: During SSR, `useTheme()` returns `undefined`. The `mounted` guard prevents:
1. A `TypeError` from calling `theme === "dark"` on `undefined`
2. A hydration mismatch from rendering different icons on server vs client

By defaulting to `isDark = true` before mount, the button renders the dark state on the server (matching `defaultTheme="dark"`), then reflects the actual theme on client mount without a visible flash.

---

## 7. useTheme Hook (Mount-Safe)

**File**: `hooks/useTheme.ts`

```ts
export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    theme: mounted ? theme : "light",
    resolvedTheme: mounted ? resolvedTheme : "light",
    setTheme,
    isDark: mounted ? resolvedTheme === "dark" : false,
    mounted,
  };
}
```

This wrapper adds:
- `isDark` boolean convenience accessor
- `mounted` flag for conditional rendering
- Safe defaults before hydration

**Use this hook** instead of calling `useTheme()` from `next-themes` directly, to ensure consistent hydration-safe behavior across all components.

---

## 8. Glassmorphism System

Glassmorphism is the visual language of FullPrep's card system. It creates layered, translucent surfaces with blur and subtle borders.

### Standard glassmorphism card (light/dark adaptive)

```tsx
// bg-card-bg uses the CSS variable (transparent white in light, dark in dark)
<div className="bg-card-bg border border-border-card rounded-2xl shadow-sm backdrop-blur-sm">
  Content
</div>
```

### Dark-only glassmorphism (sidebar, popover)

Used in the sidebar and profile popover — always dark regardless of theme:

```tsx
<div className="bg-[#06090f]/95 backdrop-blur-xl border border-brand-orange/15 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)]">
  Content
</div>
```

### Glassmorphism depth levels

| Level | CSS | Use case |
|---|---|---|
| **Surface** | `bg-card-bg border border-border-card` | Standard cards |
| **Elevated** | `bg-card-bg shadow-md border border-border-card` | Stat cards |
| **Floating** | `bg-[#06090f]/95 backdrop-blur-xl shadow-[0_10px_40px...]` | Popovers, modals |
| **Deep** | `bg-gradient-to-b from-[#11131c] to-[#090a10]` | Sidebar streak card |

### Glow effects

Brand-colored glow is used sparingly for interactive and highlighted elements:

```tsx
// Orange glow button
className="shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:shadow-[0_6px_16px_rgba(255,106,0,0.35)]"

// Orange glow active sidebar item
className="shadow-[0_0_14px_rgba(255,106,0,0.12)]"

// Purple glow badge
className="shadow-[0_0_4px_rgba(139,92,246,0.45)]"
```

---

## 9. Typography System

**Font**: Inter (Google Fonts), loaded via `next/font/google`

```ts
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});
```

Applied to `<html>` via the `variable` class, then referenced in CSS:

```css
body {
  font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "cv02", "cv03", "cv04", "cv11"; /* Premium Inter OpenType features */
  letter-spacing: -0.015em; /* Apple/Linear-style tight tracking */
}
```

### Typography scale (Tailwind utilities)

| Element | Classes |
|---|---|
| Page title | `text-2xl font-bold tracking-tight` |
| Section heading | `text-lg font-semibold` |
| Card heading | `text-base font-semibold` |
| Body text | `text-sm text-text-secondary` |
| Caption/label | `text-xs text-text-muted` |
| Stat number | `text-3xl font-bold tracking-[-0.02em]` |
| Navigation item | `text-[14px] font-medium tracking-[-0.01em]` |

---

## 10. Sidebar Theme Locking

The Sidebar component is **theme-locked to dark mode** — it always renders with dark background values regardless of the app theme:

```tsx
<aside className="bg-[#06090f] text-white ...">
```

### Why?

1. **Visual anchoring**: The sidebar is a navigation surface, not content. A white sidebar in light mode creates excessive visual competition with the content area.
2. **Brand consistency**: The orange `#ff6a00` brand color pops more against the dark `#06090f` background.
3. **Cognitive load**: Users develop muscle memory for the sidebar position and appearance. Changing its color on theme switch would be jarring.
4. **Design precedent**: Major tools (VS Code, Linear, Figma) use permanently dark sidebars.

### How to replicate this pattern

For any component you want to theme-lock:

```tsx
// ✅ Theme-locked to dark (hardcoded values, ignores CSS variables)
<div className="bg-[#06090f] text-white border-white/[0.04]">

// ✅ Theme-adaptive (uses CSS variables)
<div className="bg-bg-page text-text-primary border-border-card">

// ❌ Mixed — avoid (semantic + raw color creates inconsistency)
<div className="bg-bg-page text-white">
```

---

## 11. Building New Themed Components

### ✅ Safe Pattern: Semantic CSS variable classes

```tsx
// This component works correctly in both light and dark mode
export function MyCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card-bg border border-border-card rounded-2xl p-6 shadow-sm">
      <h2 className="text-text-primary font-semibold text-lg">Title</h2>
      <p className="text-text-secondary text-sm mt-2">{children}</p>
    </div>
  );
}
```

### ✅ Safe Pattern: Brand color (always consistent)

```tsx
<button className="bg-brand-orange hover:bg-[#e05d00] text-white px-4 py-2 rounded-xl">
  Submit
</button>
```

### ✅ Safe Pattern: `dark:` override for one-off adjustments

```tsx
// Use dark: prefix when a token doesn't perfectly cover your need
<div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10">
```

### ✅ Safe Pattern: Theme-aware icon colors

```tsx
const { isDark } = useTheme();

<Icon className={isDark ? "text-white" : "text-gray-900"} />
```

Or with Tailwind:
```tsx
<Icon className="text-gray-900 dark:text-white" />
```

### ✅ Safe Pattern: mounted guard for theme-conditional rendering

```tsx
const { mounted, isDark } = useTheme();

if (!mounted) return null; // or a skeleton

return <div className={isDark ? "dark-styles" : "light-styles"}>...</div>;
```

---

## 12. Avoiding Theme Breakage

### ❌ Don't: Read theme values before mount

```tsx
// ❌ WRONG: useTheme returns undefined on SSR
const { theme } = useTheme();
const bg = theme === "dark" ? "#0b0f17" : "#f5f7fb"; // Can throw!
```

```tsx
// ✅ RIGHT: Guard with mounted
const { mounted, isDark } = useTheme(); // using hooks/useTheme.ts
const bg = mounted ? (isDark ? "#0b0f17" : "#f5f7fb") : "#f5f7fb";
```

### ❌ Don't: Hardcode colors in theme-adaptive components

```tsx
// ❌ WRONG: this will look broken in light mode
<div className="bg-[#0b0f17] text-white">...</div>
```

```tsx
// ✅ RIGHT: use semantic tokens
<div className="bg-bg-page text-text-primary">...</div>
```

### ❌ Don't: Use opacity-based text on dynamic backgrounds

```tsx
// ❌ WRONG: rgba(255,255,255,0.6) is invisible on white backgrounds (light mode)
<p className="text-[rgba(255,255,255,0.6)]">Subtitle</p>
```

```tsx
// ✅ RIGHT: use semantic token that adjusts per theme
<p className="text-text-secondary">Subtitle</p>
```

### ❌ Don't: Forget layout shifts from mounted guard

```tsx
// ❌ BAD: null before mount causes layout shift
if (!mounted) return null;

// ✅ BETTER: render a skeleton or same-size placeholder
if (!mounted) return <div className="h-10 w-[72px] rounded-full bg-card-bg animate-pulse" />;
```

### ❌ Don't: Mix `dark:` variants with CSS variable tokens inconsistently

```tsx
// ❌ CONFUSING: mixing approaches in same component
<div className="bg-white dark:bg-[#111827] text-text-primary">
```

```tsx
// ✅ CONSISTENT: pick one approach per component
// Option A: all tokens
<div className="bg-card-bg text-text-primary">

// Option B: all dark: variants (useful for one-off components)
<div className="bg-white dark:bg-[#111827] text-gray-900 dark:text-white">
```

---

## 13. Theme Constants Reference

**File**: `constants/theme.ts`

Use these constants for programmatic styling (e.g., chart colors, dynamic styles):

```ts
import { THEME_COLORS, THEME_SPACING, THEME_RADIUS } from "@/constants/theme";

// Brand color
THEME_COLORS.orange          // "#ff6a00"
THEME_COLORS.orangeHover     // "#e05d00"
THEME_COLORS.backgroundDark  // "#0b0f17"

// Spacing
THEME_SPACING.sidebarWidthExpanded  // "270px"
THEME_SPACING.sidebarWidthCollapsed // "80px"
THEME_SPACING.navbarHeight          // "76px"

// Border radius
THEME_RADIUS.card     // "rounded-[24px]"
THEME_RADIUS.button   // "rounded-xl"
THEME_RADIUS.badge    // "rounded-lg"

// Shadows
THEME_SHADOWS.orangeGlow  // "shadow-[0_4px_12px_rgba(255,106,0,0.25)]"

// Z-index
THEME_Z_INDEX.sidebarDrawer // "z-50"
THEME_Z_INDEX.navbar        // "z-20"
```

**When to use constants vs Tailwind classes**:
- **Recharts colors**: Must use JS values — use `THEME_COLORS`
- **Dynamic `style={}` props**: Use `THEME_COLORS`, `THEME_SPACING`
- **Regular className rendering**: Use Tailwind classes directly

---

## Quick Reference

```
Theme Token          Tailwind Class         Light Value          Dark Value
─────────────────────────────────────────────────────────────────────────────
Background           bg-bg-page             #f5f7fb              #0b0f17
Card background      bg-card-bg             rgba(255,255,255,.9) #0b1020
Card border          border-border-card     #e2e8f0              rgba(255,255,255,.06)
Primary text         text-text-primary      #111827              #ffffff
Secondary text       text-text-secondary    #64748b              rgba(255,255,255,.60)
Muted text           text-text-muted        #94a3b8              rgba(255,255,255,.40)
Brand orange         bg/text-brand-orange   #ff6a00              #ff6a00 (same)
```
