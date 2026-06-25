import type { Theme, ThemeId } from './theme.types';
import { darkFantasyTheme, lightTheme } from './themes';

/**
 * Theme registry — a single place to register every theme the app knows
 * about. Admin / white-label remote themes can be merged in at boot via
 * `registerTheme()`; the runtime always picks themes by `id`.
 */
class ThemeRegistry {
  private readonly themes = new Map<ThemeId, Theme>();

  constructor(initial: Theme[]) {
    initial.forEach((t) => this.themes.set(t.id, t));
  }

  register(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  get(id: ThemeId): Theme | undefined {
    return this.themes.get(id);
  }

  getOrDefault(id: ThemeId | undefined, fallbackId: ThemeId): Theme {
    const t = id ? this.themes.get(id) : undefined;
    return t ?? (this.themes.get(fallbackId) as Theme);
  }

  list(): Theme[] {
    return Array.from(this.themes.values());
  }

  has(id: ThemeId): boolean {
    return this.themes.has(id);
  }
}

export const themeRegistry = new ThemeRegistry([darkFantasyTheme, lightTheme]);
