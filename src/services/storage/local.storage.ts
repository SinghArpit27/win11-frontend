import { logger } from '@utils/logger';

/**
 * Tiny typed wrapper around `window.localStorage`:
 *  - JSON-serialises non-string values automatically,
 *  - swallows quota / SSR errors so callers don't have to try/catch,
 *  - returns `null` (never throws) on read miss / parse failure.
 *
 * For sensitive secrets prefer http-only cookies (set by the backend).
 * This module is for non-sensitive UI state (theme, last route, etc.).
 */

const isBrowser = (): boolean => typeof window !== 'undefined' && !!window.localStorage;

export const localStore = {
  get<T>(key: string): T | null {
    if (!isBrowser()) return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      logger.warn('localStore.get failed', { key, err });
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      logger.warn('localStore.set failed', { key, err });
    }
  },

  remove(key: string): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      logger.warn('localStore.remove failed', { key, err });
    }
  },

  clear(): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.clear();
    } catch (err) {
      logger.warn('localStore.clear failed', { err });
    }
  },
};

export type LocalStore = typeof localStore;
