import type { Theme } from '../theme.types';
import { Layout } from '../tokens/breakpoints';
import { Palette } from '../tokens/colors';
import { Gradients } from '../tokens/gradients';
import { Radius } from '../tokens/radius';
import { LightShadow } from '../tokens/shadows';
import { Spacing } from '../tokens/spacing';
import { TypographyVariants } from '../tokens/typography';

/**
 * Light theme — same fantasy-sports brand language, light surfaces.
 * White / soft-gray backgrounds with crimson accents and subtle gradients.
 */
export const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  mode: 'light',
  colors: {
    bg: Palette.ink50,
    bgElevated: Palette.white,
    surface: Palette.white,
    surfaceElevated: Palette.white,
    surfaceHover: Palette.ink50,
    primary: Palette.crimson500,
    primaryHover: Palette.crimson600,
    primaryForeground: Palette.white,
    primaryMuted: 'rgba(229, 57, 53, 0.12)',
    primarySoft: 'rgba(229, 57, 53, 0.06)',
    accent: Palette.crimson400,
    accentHover: Palette.crimson500,
    text: Palette.ink900,
    textMuted: Palette.ink500,
    textInverse: Palette.white,
    border: Palette.ink150,
    borderStrong: Palette.ink200,
    sidebar: Palette.white,
    sidebarBorder: Palette.ink150,
    success: Palette.success,
    warning: Palette.warning,
    danger: Palette.danger,
    info: Palette.info,
    tabActive: Palette.crimson500,
    tabInactive: Palette.ink400,
  },
  gradients: {
    ...Gradients,
    // Light theme uses lighter card / surface gradients.
    card: Gradients.cardLight,
    surface: Gradients.surfaceLight,
  },
  card: {
    default: { radius: 'lg', paddingX: 'lg', paddingY: 'lg', shadow: 'xs', border: true },
    elevated: { radius: 'xl', paddingX: 'lg', paddingY: 'lg', shadow: 'sm', border: false },
    flat: { radius: 'md', paddingX: 'md', paddingY: 'md', shadow: 'none', border: true },
  },
  spacing: { ...Spacing },
  radius: { ...Radius },
  shadows: { ...LightShadow },
  typography: { ...TypographyVariants },
  layout: { ...Layout },
};
