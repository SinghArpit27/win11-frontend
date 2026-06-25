/**
 * Responsive breakpoints. Mobile-first — every value is a min-width target.
 *
 * Aliases:
 *  - **mobile**   < md (640–767px and below)
 *  - **tablet**   md ≤ w < lg
 *  - **desktop**  ≥ lg
 *
 * The numeric values are also emitted as CSS variables (`--w11-bp-*`) so
 * non-Tailwind contexts (CSS modules, inline styles, framer-motion) can
 * reference them without re-declaring the scale.
 */
export const Breakpoints = {
  xs: 360,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof Breakpoints;

/**
 * Layout constants exposed to the runtime theme.
 *
 * - `appMaxWidth`    — mobile-style narrow column. Kept around for
 *                       single-pane experiences (auth, OTP, onboarding).
 *                       NEVER apply this on the authenticated shell.
 * - `contentMaxWidth`— cap for desktop content area so a 32" monitor
 *                       doesn't stretch lines to 200ch.
 * - `sidebarWidth`   — primary desktop sidebar (user + admin).
 * - `sidebarCollapsedWidth` — reserved for a future collapsed rail.
 * - `topBarHeight`   — sticky mobile top bar.
 * - `desktopTopBarHeight` — desktop top navbar (slightly taller).
 * - `tabBarHeight`   — sticky mobile bottom-tab bar.
 */
export const Layout = {
  appMaxWidth: 480,
  contentMaxWidth: 1440,
  sidebarWidth: 264,
  sidebarCollapsedWidth: 72,
  topBarHeight: 56,
  desktopTopBarHeight: 64,
  tabBarHeight: 64,
} as const;

export type LayoutKey = keyof typeof Layout;
