import { useContext } from 'react';

import { ThemeContext, type ThemeContextValue } from '@theme/theme.context';

/**
 * Access the active theme + setters from anywhere under <ThemeProvider>.
 *
 * Throws if used outside the provider — that's a programmer error and
 * we want it to be obvious, not silently wrong.
 */
export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside <ThemeProvider>.');
  }
  return ctx;
};
