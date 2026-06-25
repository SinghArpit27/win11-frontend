import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Cross-cutting UI state that doesn't belong to a feature slice:
 *  - global loading + boot status,
 *  - online/offline awareness,
 *  - active bottom tab (for restoring after deep-link),
 *  - one-off snackbar / toast (phase-1 stub; richer toast in later phase).
 */

export type BootStatus = 'pending' | 'ready' | 'error';

export interface Toast {
  id: string;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'danger';
}

export interface AppState {
  bootStatus: BootStatus;
  isOnline: boolean;
  activeTabId: string | null;
  toast: Toast | null;
}

const initialState: AppState = {
  bootStatus: 'pending',
  isOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
  activeTabId: null,
  toast: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setBootStatus(state, action: PayloadAction<BootStatus>) {
      state.bootStatus = action.payload;
    },
    setOnline(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setActiveTab(state, action: PayloadAction<string | null>) {
      state.activeTabId = action.payload;
    },
    showToast(state, action: PayloadAction<Omit<Toast, 'id'> & Partial<Pick<Toast, 'id'>>>) {
      state.toast = {
        id: action.payload.id ?? crypto.randomUUID(),
        message: action.payload.message,
        variant: action.payload.variant,
      };
    },
    dismissToast(state) {
      state.toast = null;
    },
  },
});

export const { setBootStatus, setOnline, setActiveTab, showToast, dismissToast } =
  appSlice.actions;
export const appReducer = appSlice.reducer;

export const selectBootStatus = (s: { app: AppState }): BootStatus => s.app.bootStatus;
export const selectIsOnline = (s: { app: AppState }): boolean => s.app.isOnline;
export const selectActiveTab = (s: { app: AppState }): string | null => s.app.activeTabId;
export const selectToast = (s: { app: AppState }): Toast | null => s.app.toast;
