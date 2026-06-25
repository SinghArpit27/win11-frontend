import { combineReducers } from '@reduxjs/toolkit';

import { authReducer } from '@features/auth/auth.slice';

import { baseApi } from './api/base.api';
import { appReducer } from './slices/app.slice';
import { themeReducer } from './slices/theme.slice';

/**
 * Root reducer. Feature reducers should be merged in by their owning
 * phase via this file — keeps store composition discoverable in one place.
 *
 * RTK Query's `baseApi` slice is mounted at its `reducerPath` so all
 * future injected endpoints share a single cache.
 */
export const rootReducer = combineReducers({
  app: appReducer,
  theme: themeReducer,
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export type RootReducer = typeof rootReducer;
