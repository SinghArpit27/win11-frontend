import type { GradientStops } from './tokens/gradients';
import type { RadiusKey } from './tokens/radius';
import type { ShadowKey } from './tokens/shadows';
import type { SpacingKey } from './tokens/spacing';
import type { TypographyVariant, TypographyVariantStyle } from './tokens/typography';

/**
 * Theme contract — a plain serialisable shape so themes can be:
 *  - hot-swapped at runtime,
 *  - persisted to localStorage,
 *  - fetched from the backend admin panel (white-label control).
 *
 * Components NEVER read raw palette values — they read semantic colors
 * (`primary`, `text`, `surface`) which the theme decides. That makes the
 * UI white-label-ready by construction.
 */

export type ThemeMode = 'dark' | 'light' | 'system';

export interface SemanticColors {
  /** App-level background — the deepest layer behind every surface. */
  bg: string;
  /** Subtle elevation above `bg` (page sections, sticky bars). */
  bgElevated: string;
  /** Base card / panel surface. */
  surface: string;
  /** Elevated card surface (modals, popovers, hovered tiles). */
  surfaceElevated: string;
  /** Hover background for interactive surfaces. */
  surfaceHover: string;
  /** Brand primary (fantasy sports crimson). */
  primary: string;
  /** Brand primary — darker hover/pressed shade. */
  primaryHover: string;
  /** Text colour used on top of `primary`. */
  primaryForeground: string;
  /** Translucent primary fill for badges, focus rings, active nav items. */
  primaryMuted: string;
  /** Solid primary fill for soft-emphasis surfaces (alerts, banners). */
  primarySoft: string;
  /** Secondary brand accent. */
  accent: string;
  /** Accent hover shade. */
  accentHover: string;
  /** Primary body text. */
  text: string;
  /** De-emphasised text (helpers, labels, captions). */
  textMuted: string;
  /** Text rendered on light/inverse surfaces. */
  textInverse: string;
  /** Default border / divider colour. */
  border: string;
  /** Stronger border for emphasis (focused inputs, divider headings). */
  borderStrong: string;
  /** Sidebar background (matches `surface` by default but themes can diverge). */
  sidebar: string;
  /** Sidebar border. */
  sidebarBorder: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  /** Active tab text + indicator colour. */
  tabActive: string;
  /** Inactive tab text colour. */
  tabInactive: string;
}

export interface ThemeCardStyle {
  radius: RadiusKey;
  paddingX: SpacingKey;
  paddingY: SpacingKey;
  shadow: ShadowKey;
  border: boolean;
}

export interface ThemeLayoutTokens {
  appMaxWidth: number;
  contentMaxWidth: number;
  sidebarWidth: number;
  sidebarCollapsedWidth: number;
  topBarHeight: number;
  desktopTopBarHeight: number;
  tabBarHeight: number;
}

export interface Theme {
  id: string;
  name: string;
  mode: 'dark' | 'light';
  colors: SemanticColors;
  gradients: Record<string, GradientStops>;
  card: {
    default: ThemeCardStyle;
    elevated: ThemeCardStyle;
    flat: ThemeCardStyle;
  };
  spacing: Record<SpacingKey, number>;
  radius: Record<RadiusKey, number>;
  shadows: Record<ShadowKey, string>;
  typography: Record<TypographyVariant, TypographyVariantStyle>;
  layout: ThemeLayoutTokens;
}

export type ThemeId = string;
