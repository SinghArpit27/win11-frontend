import { useEffect } from 'react';

import { OfflineBanner } from '@components/common/OfflineBanner';
import { ToastHost } from '@components/common/ToastHost';
import { useAuthReporterSync } from '@features/auth/useAuthReporterSync';
import { useAppDispatch, useAuthSocketSync, useOnlineStatusEffect } from '@hooks/index';
import { AppRouter } from '@router/index';
import { setBootStatus } from '@store/slices/app.slice';

import { AppProviders } from './AppProviders';

/**
 * Inner shell. Runs once after providers mount to mark the app as
 * "ready" — feature phases can hang boot-time effects (analytics,
 * push registration, etc.) here without touching `main.tsx`.
 */
const AppInner = (): JSX.Element => {
  const dispatch = useAppDispatch();
  useOnlineStatusEffect();
  useAuthReporterSync();
  useAuthSocketSync();

  useEffect(() => {
    dispatch(setBootStatus('ready'));
  }, [dispatch]);

  return (
    <>
      <OfflineBanner />
      <ToastHost />
      <AppRouter />
    </>
  );
};

export const App = (): JSX.Element => (
  <AppProviders>
    <AppInner />
  </AppProviders>
);
