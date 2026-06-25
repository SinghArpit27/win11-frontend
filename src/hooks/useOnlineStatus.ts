import { useEffect } from 'react';

import { setOnline } from '@store/slices/app.slice';

import { useAppDispatch } from './useStore';

/**
 * Side-effect hook installed once at the app shell — keeps the redux
 * `app.isOnline` flag in sync with the browser's native online events.
 * Components observe via `useAppSelector(selectIsOnline)`.
 */
export const useOnlineStatusEffect = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const goOnline = (): void => {
      dispatch(setOnline(true));
    };
    const goOffline = (): void => {
      dispatch(setOnline(false));
    };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [dispatch]);
};
