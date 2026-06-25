import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { appConfig } from '@config/index';

import { baseApi } from './api/base.api';
import { rootReducer } from './root.reducer';

/**
 * Factory so tests can spin up an isolated store. The default exported
 * `store` is used by the app shell.
 */
export const makeStore = (): ReturnType<typeof configureStore<ReturnType<typeof rootReducer>>> =>
  configureStore({
    reducer: rootReducer,
    middleware: (gDM) =>
      gDM({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
        immutableCheck: appConfig.environment !== 'production',
      }).concat(baseApi.middleware),
    devTools: appConfig.environment !== 'production',
  });

export const store = makeStore();

setupListeners(store.dispatch);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
