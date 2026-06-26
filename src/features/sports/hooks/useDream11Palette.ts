import { useMemo } from 'react';

import { useTheme } from '@hooks/useTheme';

import { getDream11Palette, type Dream11Palette } from '../dream11.tokens';

/** Resolved Dream11 palette for the active light/dark theme mode. */
export const useDream11Palette = (): Dream11Palette => {
  const { theme } = useTheme();
  return useMemo(() => getDream11Palette(theme.mode === 'dark'), [theme.mode]);
};

export const useIsDarkTheme = (): boolean => {
  const { theme } = useTheme();
  return theme.mode === 'dark';
};
