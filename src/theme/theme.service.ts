import { STORAGE_KEYS } from '@constants/index';
import { localStore } from '@services/storage';

import { applyThemeToDom } from './cssVars';
import { themeRegistry } from './theme.registry';
import type { Theme, ThemeId, ThemeMode } from './theme.types';

/**
 * Single entry point for everything theme-related at runtime:
 *  - resolve the *current* theme from persisted preference + system,
 *  - apply it to the DOM,
 *  - persist user choice,
 *  - subscribe to OS color-scheme changes when mode = "system".
 *
 * Stateless on purpose — the Redux `theme.slice` owns reactive state.
 */
export interface ResolvedTheme {
  theme: Theme;
  mode: ThemeMode;
}

export interface ThemePreference {
  themeId: ThemeId;
  mode: ThemeMode;
}

const DEFAULT_THEME_ID: ThemeId = 'dark-fantasy';
const DEFAULT_MODE: ThemeMode = 'dark';

export class ThemeService {
  private mediaQuery: MediaQueryList | null = null;
  private systemChangeUnsub: (() => void) | null = null;

  /** Resolve the initial preference using persisted value > env defaults. */
  loadPreference(envDefaults: ThemePreference): ThemePreference {
    const stored = localStore.get<ThemePreference>(STORAGE_KEYS.THEME);
    if (stored && themeRegistry.has(stored.themeId)) return stored;
    return envDefaults;
  }

  savePreference(pref: ThemePreference): void {
    localStore.set(STORAGE_KEYS.THEME, pref);
  }

  resolve(pref: ThemePreference): ResolvedTheme {
    const effectiveMode: 'dark' | 'light' =
      pref.mode === 'system' ? this.detectSystemMode() : pref.mode;

    const target = themeRegistry.get(pref.themeId);
    const matchesMode = target && target.mode === effectiveMode ? target : undefined;

    const fallback =
      matchesMode ??
      themeRegistry.list().find((t) => t.mode === effectiveMode) ??
      themeRegistry.getOrDefault(pref.themeId, DEFAULT_THEME_ID);

    return { theme: fallback, mode: pref.mode };
  }

  apply(theme: Theme): void {
    if (typeof document === 'undefined') return;
    applyThemeToDom(theme);
  }

  detectSystemMode(): 'dark' | 'light' {
    if (typeof window === 'undefined' || !window.matchMedia) return DEFAULT_MODE;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Subscribe to OS color-scheme changes. Returns an unsubscribe fn.
   * Caller is responsible for calling it on cleanup.
   */
  subscribeToSystemMode(cb: (mode: 'dark' | 'light') => void): () => void {
    if (typeof window === 'undefined' || !window.matchMedia) return () => undefined;

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent): void => cb(e.matches ? 'dark' : 'light');
    this.mediaQuery.addEventListener('change', handler);

    this.systemChangeUnsub = () => this.mediaQuery?.removeEventListener('change', handler);
    return this.systemChangeUnsub;
  }
}

export const themeService = new ThemeService();
export { DEFAULT_THEME_ID, DEFAULT_MODE };
