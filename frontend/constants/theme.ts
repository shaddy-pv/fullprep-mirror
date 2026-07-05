/**
 * Centralized Theme Constants for FullPrep Design System
 * Ensures pixel-perfect alignment, exact responsive limits, and unified styling
 */

export const THEME_COLORS = {
  orange: "var(--brand-accent, #ff6a00)",
  orangeHover: "#e05d00",
  backgroundLight: "#f7f7f4",
  backgroundDark: "#0b0f17",
  cardLight: "#ffffff",
  cardDark: "#111827",
  sidebarLight: "#111217",
  sidebarDark: "#06090f",
  borderLight: "#e7e5df",
  borderDark: "rgba(255,255,255,0.06)",
  textPrimaryLight: "#111827",
  textPrimaryDark: "#f3f4f6",
  textSecondaryLight: "#6b7280",
  textSecondaryDark: "#9ca3af",
} as const;

export const THEME_SPACING = {
  sidebarWidthExpanded: "270px",
  sidebarWidthCollapsed: "80px",
  navbarHeight: "76px",
  contentMaxWidth: "1300px",
  gapLarge: "24px",  // gap-6
  gapMedium: "20px", // gap-5
  gapSmall: "16px",  // gap-4
} as const;

export const THEME_RADIUS = {
  card: "rounded-[24px]",
  statCard: "rounded-[20px]",
  button: "rounded-xl", // 12px
  input: "rounded-xl",
  badge: "rounded-lg",
} as const;

export const THEME_SHADOWS = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  orangeGlow: "shadow-[0_4px_12px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.25)]",
  orangeGlowHover: "shadow-[0_6px_16px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.35)]",
} as const;

export const THEME_TRANSITIONS = {
  fast: "transition-all duration-150 ease-in-out",
  default: "transition-all duration-300 ease-in-out",
  slow: "transition-all duration-500 ease-out",
} as const;

export const THEME_Z_INDEX = {
  backdrop: "z-40",
  sidebarDrawer: "z-50",
  navbar: "z-20",
  floatingElement: "z-30",
} as const;
