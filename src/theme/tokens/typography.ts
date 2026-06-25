/**
 * Typography scale. Variants are SEMANTIC ("h1", "label") not visual
 * ("text-24-bold") so a remote theme can re-weight the whole system
 * without code changes.
 *
 * Sizes are in px; the engine emits them as CSS variables and Tailwind
 * picks them up via `font-display` / `font-sans` overrides.
 */
export const FontFamily = {
  sans: "'Inter', 'Segoe UI', 'Roboto', system-ui, -apple-system, sans-serif",
  display:
    "'Space Grotesk', 'Inter', 'Segoe UI', 'Roboto', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
} as const;

export type FontFamilyKey = keyof typeof FontFamily;

export interface TypographyVariantStyle {
  fontFamily: FontFamilyKey;
  fontSize: number;
  lineHeight: number;
  fontWeight: 400 | 500 | 600 | 700 | 800;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export const TypographyVariants = {
  display: {
    fontFamily: 'display',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 700,
    letterSpacing: -0.5,
  },
  h1: { fontFamily: 'display', fontSize: 24, lineHeight: 30, fontWeight: 700 },
  h2: { fontFamily: 'display', fontSize: 20, lineHeight: 26, fontWeight: 700 },
  h3: { fontFamily: 'sans', fontSize: 18, lineHeight: 24, fontWeight: 600 },
  h4: { fontFamily: 'sans', fontSize: 16, lineHeight: 22, fontWeight: 600 },
  bodyLg: { fontFamily: 'sans', fontSize: 16, lineHeight: 24, fontWeight: 400 },
  body: { fontFamily: 'sans', fontSize: 14, lineHeight: 20, fontWeight: 400 },
  bodySm: { fontFamily: 'sans', fontSize: 12, lineHeight: 18, fontWeight: 400 },
  label: { fontFamily: 'sans', fontSize: 13, lineHeight: 18, fontWeight: 500 },
  caption: { fontFamily: 'sans', fontSize: 11, lineHeight: 14, fontWeight: 500 },
  button: { fontFamily: 'sans', fontSize: 14, lineHeight: 18, fontWeight: 600 },
  overline: {
    fontFamily: 'sans',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: 600,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
} as const satisfies Record<string, TypographyVariantStyle>;

export type TypographyVariant = keyof typeof TypographyVariants;
