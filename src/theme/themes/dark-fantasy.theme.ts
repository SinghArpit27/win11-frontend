import type { Theme } from '../theme.types';
import { Layout } from '../tokens/breakpoints';
import { Palette } from '../tokens/colors';
import { Gradients } from '../tokens/gradients';
import { Radius } from '../tokens/radius';
import { DarkShadow } from '../tokens/shadows';
import { Spacing } from '../tokens/spacing';
import { TypographyVariants } from '../tokens/typography';

/**
 * Default theme — premium fantasy sports dark aesthetic inspired by
 * Dream11 / MPL / My11Circle. Premium black surfaces with crimson primary
 * and red glow for high-energy CTAs.
 */
export const darkFantasyTheme: Theme = {
  id: 'dark-fantasy',
  name: 'Dark Fantasy',
  mode: 'dark',
  colors: {
    bg: Palette.ink900,
    bgElevated: Palette.ink850,
    surface: Palette.ink800,
    surfaceElevated: Palette.ink700,
    surfaceHover: Palette.ink750,
    primary: Palette.crimson500,
    primaryHover: Palette.crimson600,
    primaryForeground: Palette.white,
    primaryMuted: 'rgba(229, 57, 53, 0.16)',
    primarySoft: 'rgba(229, 57, 53, 0.10)',
    accent: Palette.crimson200,
    accentHover: Palette.crimson300,
    text: Palette.ink50,
    textMuted: Palette.ink300,
    textInverse: Palette.ink900,
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.16)',
    sidebar: Palette.ink850,
    sidebarBorder: 'rgba(255, 255, 255, 0.06)',
    success: Palette.success,
    warning: Palette.warning,
    danger: Palette.danger,
    info: Palette.info,
    tabActive: Palette.crimson400,
    tabInactive: Palette.ink400,
  },
  gradients: { ...Gradients },
  card: {
    default: { radius: 'lg', paddingX: 'lg', paddingY: 'lg', shadow: 'sm', border: true },
    elevated: { radius: 'xl', paddingX: 'lg', paddingY: 'lg', shadow: 'md', border: false },
    flat: { radius: 'md', paddingX: 'md', paddingY: 'md', shadow: 'none', border: true },
  },
  spacing: { ...Spacing },
  radius: { ...Radius },
  shadows: { ...DarkShadow },
  typography: { ...TypographyVariants },
  layout: { ...Layout },
};
