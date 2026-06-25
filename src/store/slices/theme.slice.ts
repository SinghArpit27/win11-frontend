import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { appConfig } from '@config/index';
import type { ThemeId, ThemeMode } from '@theme/theme.types';
import { themeService } from '@theme/theme.service';

/**
 * Theme slice — owns the user's PREFERENCE only. The DOM-level effect
 * (CSS variables, persistence) lives in `ThemeProvider` so the slice
 * stays pure & serialisable.
 */

export interface ThemeState {
  themeId: ThemeId;
  mode: ThemeMode;
}

const persisted = themeService.loadPreference({
  themeId: appConfig.theme.defaultId,
  mode: appConfig.theme.defaultMode,
});

const initialState: ThemeState = {
  themeId: persisted.themeId,
  mode: persisted.mode,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeId(state, action: PayloadAction<ThemeId>) {
      state.themeId = action.payload;
    },
    setMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
    toggleMode(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
    },
    resetTheme() {
      return { themeId: appConfig.theme.defaultId, mode: appConfig.theme.defaultMode };
    },
  },
});

export const { setThemeId, setMode, toggleMode, resetTheme } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;

export const selectThemeState = (s: { theme: ThemeState }): ThemeState => s.theme;
export const selectThemeId = (s: { theme: ThemeState }): ThemeId => s.theme.themeId;
export const selectThemeMode = (s: { theme: ThemeState }): ThemeMode => s.theme.mode;
