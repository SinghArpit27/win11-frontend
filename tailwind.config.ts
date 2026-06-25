import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

/**
 * Tailwind is a CSS utility engine in this app — it MUST NOT carry brand
 * colors, paddings, radii, or shadows of its own. Every visual token
 * resolves at runtime from the Global Theme Engine via CSS variables
 * (see `src/theme/cssVars.ts`).
 *
 * That means components write `bg-surface text-text border-border` and
 * the theme engine swaps the underlying value — no rebuild required.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme-mode="dark"]'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    screens: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        bg: 'var(--w11-color-bg)',
        'bg-elevated': 'var(--w11-color-bg-elevated)',
        surface: 'var(--w11-color-surface)',
        'surface-elevated': 'var(--w11-color-surface-elevated)',
        'surface-hover': 'var(--w11-color-surface-hover)',
        primary: 'var(--w11-color-primary)',
        'primary-hover': 'var(--w11-color-primary-hover)',
        'primary-foreground': 'var(--w11-color-primary-foreground)',
        'primary-muted': 'var(--w11-color-primary-muted)',
        'primary-soft': 'var(--w11-color-primary-soft)',
        accent: 'var(--w11-color-accent)',
        'accent-hover': 'var(--w11-color-accent-hover)',
        text: 'var(--w11-color-text)',
        'text-muted': 'var(--w11-color-text-muted)',
        'text-inverse': 'var(--w11-color-text-inverse)',
        border: 'var(--w11-color-border)',
        'border-strong': 'var(--w11-color-border-strong)',
        sidebar: 'var(--w11-color-sidebar)',
        'sidebar-border': 'var(--w11-color-sidebar-border)',
        success: 'var(--w11-color-success)',
        warning: 'var(--w11-color-warning)',
        danger: 'var(--w11-color-danger)',
        info: 'var(--w11-color-info)',
        'tab-active': 'var(--w11-color-tab-active)',
        'tab-inactive': 'var(--w11-color-tab-inactive)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--w11-gradient-primary)',
        'gradient-accent': 'var(--w11-gradient-accent)',
        'gradient-hero': 'var(--w11-gradient-hero)',
        'gradient-card': 'var(--w11-gradient-card)',
        'gradient-surface': 'var(--w11-gradient-surface)',
        'gradient-success': 'var(--w11-gradient-success)',
        'gradient-danger': 'var(--w11-gradient-danger)',
        'gradient-field': 'var(--w11-gradient-field)',
        'gradient-fantasy-header': 'var(--w11-gradient-fantasy-header)',
      },
      borderRadius: {
        xs: 'var(--w11-radius-xs)',
        sm: 'var(--w11-radius-sm)',
        md: 'var(--w11-radius-md)',
        lg: 'var(--w11-radius-lg)',
        xl: 'var(--w11-radius-xl)',
        '2xl': 'var(--w11-radius-2xl)',
        pill: 'var(--w11-radius-pill)',
      },
      boxShadow: {
        xs: 'var(--w11-shadow-xs)',
        sm: 'var(--w11-shadow-sm)',
        md: 'var(--w11-shadow-md)',
        lg: 'var(--w11-shadow-lg)',
        xl: 'var(--w11-shadow-xl)',
        glow: 'var(--w11-shadow-glow)',
        inset: 'var(--w11-shadow-inset)',
        elevated: 'var(--w11-shadow-md)',
      },
      fontFamily: {
        sans: 'var(--w11-font-sans)',
        display: 'var(--w11-font-display)',
        mono: 'var(--w11-font-mono)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        'tab-bar': 'var(--w11-layout-tab-bar-height)',
        'top-bar': 'var(--w11-layout-top-bar-height)',
        'desktop-top-bar': 'var(--w11-layout-desktop-top-bar-height)',
        sidebar: 'var(--w11-layout-sidebar-width)',
        'sidebar-collapsed': 'var(--w11-layout-sidebar-collapsed-width)',
      },
      width: {
        sidebar: 'var(--w11-layout-sidebar-width)',
        'sidebar-collapsed': 'var(--w11-layout-sidebar-collapsed-width)',
      },
      minWidth: {
        sidebar: 'var(--w11-layout-sidebar-width)',
      },
      height: {
        'top-bar': 'var(--w11-layout-top-bar-height)',
        'desktop-top-bar': 'var(--w11-layout-desktop-top-bar-height)',
        'tab-bar': 'var(--w11-layout-tab-bar-height)',
      },
      maxWidth: {
        app: 'var(--w11-layout-app-max-width)',
        content: 'var(--w11-layout-content-max-width)',
      },
      transitionTimingFunction: {
        'app-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms var(--w11-ease-out)',
        'slide-up': 'slide-up 220ms var(--w11-ease-out)',
        'slide-in-right': 'slide-in-right 240ms var(--w11-ease-out)',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [animate],
};

export default config;
