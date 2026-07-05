export const DESIGN_SYSTEM = {
  borderRadius: {
    card: "24px",
    button: "12px",
    badge: "5px",
    input: "12px",
  },
  spacing: {
    cardPadding: "24px",
    gapSection: "28px",
    gapInternal: "16px",
    rowPadding: "12px 16px",
  },
  glows: {
    orange: "shadow-[0_0_15px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.12)]",
    orangeHover: "shadow-[0_0_20px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.55),_0_6px_16px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.35)]",
    purple: "shadow-[0_0_15px_rgba(139,92,246,0.15)]",
  },
  transition: {
    default: "transition-all duration-300 ease-in-out",
    fast: "transition-all duration-200 ease-out",
  },
  dimensions: {
    sidebarWidth: "270px",
    sidebarCollapsedWidth: "80px",
    navbarHeight: "76px",
  },
} as const;

export const DESIGN_SYSTEM_TOKENS = {
  // Premium Surface Backgrounds
  surfaces: {
    bgPage: "bg-bg-page",
    card: "bg-card-bg border border-border-card shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-md",
    cardHover: "hover:border-slate-900/15 dark:hover:border-white/[0.12] hover:-translate-y-[1px] transition-all duration-300",
    sidebar: "bg-[#06090f] border-r border-white/[0.04] text-white",
    navbar: "bg-[#0b0f17]/80 backdrop-blur-md border-b border-white/[0.06] text-white",
  },
  
  // High-Contrast Typography & Texts
  typography: {
    title: "text-text-primary font-bold tracking-tight",
    primary: "text-text-primary font-sans antialiased",
    secondary: "text-text-secondary font-medium",
    muted: "text-text-muted font-medium",
    label: "text-[9.5px] text-text-muted font-bold uppercase tracking-widest leading-none select-none",
  },

  // Inputs & Forms Theming
  forms: {
    input: "w-full h-10 bg-white dark:bg-[#07080e]/60 border border-border-card rounded-xl px-3.5 py-2 text-sm font-medium text-text-primary placeholder-text-secondary/40 focus:outline-none focus:ring-1 focus:border-brand-orange focus:ring-brand-orange/20 transition-all duration-200 mt-2",
    textarea: "w-full h-24 bg-white dark:bg-[#07080e]/60 border border-border-card rounded-xl px-3.5 py-2.5 text-sm font-medium text-text-primary placeholder-text-secondary/40 focus:outline-none focus:ring-1 focus:border-brand-orange focus:ring-brand-orange/20 transition-all duration-200 mt-2 resize-none leading-relaxed",
    select: "w-full border border-border-card rounded-xl bg-white dark:bg-[#0a0b12]/60 px-3.5 text-sm font-medium text-text-primary focus:outline-none appearance-none h-10 leading-none cursor-pointer focus:border-brand-orange focus:ring-brand-orange/20",
    toggle: "w-9 h-5 rounded-full p-0.5 transition-all duration-300 relative flex items-center shrink-0 cursor-pointer bg-slate-900/10 dark:bg-white/[0.04] border border-slate-900/[0.12] dark:border-white/[0.08]",
    toggleActive: "bg-brand-orange shadow-[0_0_6px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.2)]",
  },

  // Action Buttons
  buttons: {
    primary: "flex items-center justify-center bg-brand-orange hover:bg-[#e05d00] text-white rounded-xl px-5 py-2.5 text-sm font-bold shadow-md shadow-brand-orange/15 hover:shadow-[0_0_12px_rgba(var(--brand-accent-rgb, 255, 106, 0),0.3)] cursor-pointer transition-all duration-200 leading-none h-[38px] hover:scale-[1.01]",
    secondary: "flex items-center justify-center gap-1.5 border border-border-card bg-slate-900/5 dark:bg-white/[0.04] hover:bg-slate-900/10 dark:hover:bg-white/[0.08] text-text-primary px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer h-[28px] leading-none",
    orangeGhost: "bg-brand-orange/10 hover:bg-brand-orange/15 dark:bg-brand-orange/15 dark:hover:bg-brand-orange/20 border border-brand-orange/20 dark:border-brand-orange/30 text-brand-orange text-[11px] font-bold rounded-lg px-4 py-2 transition-all duration-200 cursor-pointer h-[32px] leading-none",
  },
} as const;
