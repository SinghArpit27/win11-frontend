import { useCallback, useEffect, useMemo, type ReactNode } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/useStore';
import { selectThemeState, setMode, setThemeId, toggleMode } from '@store/slices/theme.slice';

import { ThemeContext, type ThemeContextValue } from './theme.context';
import { themeRegistry } from './theme.registry';
import { themeService } from './theme.service';
import type { ThemeId, ThemeMode } from './theme.types';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Reads the theme slice, resolves it against the registry, applies CSS
 * variables, and re-applies them whenever the OS color-scheme changes
 * (only relevant when mode = "system").
 *
 * Keeps the side-effects (`applyThemeToDom`, system listeners) out of
 * the slice so the slice stays pure / serialisable.
 */
export const ThemeProvider = ({ children }: ThemeProviderProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const { themeId, mode } = useAppSelector(selectThemeState);

  const resolved = useMemo(
    () => themeService.resolve({ themeId, mode }),
    [themeId, mode],
  );

  useEffect(() => {
    themeService.apply(resolved.theme);
    themeService.savePreference({ themeId, mode });
  }, [resolved.theme, themeId, mode]);

  useEffect(() => {
    if (mode !== 'system') return;
    const unsubscribe = themeService.subscribeToSystemMode(() => {
      const next = themeService.resolve({ themeId, mode });
      themeService.apply(next.theme);
    });
    return unsubscribe;
  }, [mode, themeId]);

  const handleSetThemeId = useCallback(
    (id: ThemeId) => {
      if (!themeRegistry.has(id)) return;
      dispatch(setThemeId(id));
    },
    [dispatch],
  );

  const handleSetMode = useCallback(
    (next: ThemeMode) => dispatch(setMode(next)),
    [dispatch],
  );

  const handleToggleMode = useCallback(() => dispatch(toggleMode()), [dispatch]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolved.theme,
      themeId,
      mode,
      setThemeId: handleSetThemeId,
      setMode: handleSetMode,
      toggleMode: handleToggleMode,
    }),
    [resolved.theme, themeId, mode, handleSetThemeId, handleSetMode, handleToggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
