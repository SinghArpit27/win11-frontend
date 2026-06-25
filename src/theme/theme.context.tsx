import { createContext } from 'react';

import type { Theme, ThemeId, ThemeMode } from './theme.types';

/**
 * React context for the resolved theme.
 *
 * Components read theme tokens through `useTheme()` rather than this
 * context directly — the hook adds null-safety and a stable selector.
 *
 * The context value is intentionally narrow: components should not
 * imperatively mutate the theme. Setters live on Redux (theme.slice)
 * to keep state changes flux-style and testable.
 */
export interface ThemeContextValue {
  theme: Theme;
  themeId: ThemeId;
  mode: ThemeMode;
  setThemeId: (id: ThemeId) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
ThemeContext.displayName = 'ThemeContext';
