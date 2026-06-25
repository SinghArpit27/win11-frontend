import { Breakpoints } from './tokens/breakpoints';
import { gradientToCss } from './tokens/gradients';
import { Motion } from './tokens/motion';
import type { Theme } from './theme.types';

const VAR_PREFIX = '--w11';

/**
 * Convert a theme object into a flat CSS-variable map. Components only
 * ever consume these vars (directly or via Tailwind `bg-surface`, etc.)
 * so swapping a theme is a single style attribute mutation — no remount,
 * no recompile, no rebuild.
 */
export const themeToCssVars = (theme: Theme): Record<string, string> => {
  const vars: Record<string, string> = {};

  for (const [key, value] of Object.entries(theme.colors)) {
    vars[`${VAR_PREFIX}-color-${kebab(key)}`] = value;
  }

  for (const [key, stops] of Object.entries(theme.gradients)) {
    vars[`${VAR_PREFIX}-gradient-${kebab(key)}`] = gradientToCss(stops);
  }

  for (const [key, value] of Object.entries(theme.spacing)) {
    vars[`${VAR_PREFIX}-space-${kebab(key)}`] = `${value}px`;
  }
  for (const [key, value] of Object.entries(theme.radius)) {
    vars[`${VAR_PREFIX}-radius-${kebab(key)}`] = `${value}px`;
  }
  for (const [key, value] of Object.entries(theme.shadows)) {
    vars[`${VAR_PREFIX}-shadow-${kebab(key)}`] = value;
  }

  // Layout tokens — every responsive layout class reads these so designers
  // can rebrand widths without touching component code.
  vars[`${VAR_PREFIX}-layout-app-max-width`] = `${theme.layout.appMaxWidth}px`;
  vars[`${VAR_PREFIX}-layout-content-max-width`] = `${theme.layout.contentMaxWidth}px`;
  vars[`${VAR_PREFIX}-layout-sidebar-width`] = `${theme.layout.sidebarWidth}px`;
  vars[`${VAR_PREFIX}-layout-sidebar-collapsed-width`] =
    `${theme.layout.sidebarCollapsedWidth}px`;
  vars[`${VAR_PREFIX}-layout-top-bar-height`] = `${theme.layout.topBarHeight}px`;
  vars[`${VAR_PREFIX}-layout-desktop-top-bar-height`] =
    `${theme.layout.desktopTopBarHeight}px`;
  vars[`${VAR_PREFIX}-layout-tab-bar-height`] = `${theme.layout.tabBarHeight}px`;

  // Breakpoints — exposed for CSS / inline-style consumers (rare, but cheap).
  for (const [key, value] of Object.entries(Breakpoints)) {
    vars[`${VAR_PREFIX}-bp-${kebab(key)}`] = `${value}px`;
  }

  vars[`${VAR_PREFIX}-font-sans`] =
    "'Inter', 'Segoe UI', 'Roboto', system-ui, -apple-system, sans-serif";
  vars[`${VAR_PREFIX}-font-display`] =
    "'Space Grotesk', 'Inter', 'Segoe UI', 'Roboto', system-ui, -apple-system, sans-serif";
  vars[`${VAR_PREFIX}-font-mono`] =
    "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace";

  vars[`${VAR_PREFIX}-ease-out`] = Motion.easing.out;
  vars[`${VAR_PREFIX}-ease-in-out`] = Motion.easing.inOut;
  vars[`${VAR_PREFIX}-ease-spring`] = Motion.easing.spring;
  vars[`${VAR_PREFIX}-duration-fast`] = `${Motion.duration.fast}ms`;
  vars[`${VAR_PREFIX}-duration-base`] = `${Motion.duration.base}ms`;
  vars[`${VAR_PREFIX}-duration-slow`] = `${Motion.duration.slow}ms`;

  return vars;
};

/**
 * Apply a theme to a DOM element (default = `<html>`). We write CSS
 * variables, not a class swap, so partial overrides (e.g. only `primary`
 * from an admin push) are trivial — just mutate the few vars that changed.
 */
export const applyThemeToDom = (
  theme: Theme,
  target: HTMLElement = document.documentElement,
): void => {
  const vars = themeToCssVars(theme);
  for (const [k, v] of Object.entries(vars)) target.style.setProperty(k, v);

  target.dataset.themeId = theme.id;
  target.dataset.themeMode = theme.mode;
  target.style.colorScheme = theme.mode;
};

const kebab = (s: string): string =>
  s.replace(/([A-Z])/g, '-$1').replace(/[_\s]+/g, '-').toLowerCase();
