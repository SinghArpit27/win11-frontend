import { useEffect } from 'react';

import { authStorage } from '@features/auth/auth.storage';
import { selectIsAuthenticated } from '@features/auth/auth.slice';
import { useAppDispatch, useAppSelector } from '@hooks/index';
import { installRealtimeListeners } from '@services/socket/socket.listeners';
import { realtimeSockets } from '@services/socket/realtime.client';

/**
 * Keeps Socket.io connections aligned with auth state and installs global
 * realtime → RTK cache invalidation listeners once per session.
 */
export const useAuthSocketSync = (): void => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    installRealtimeListeners(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      realtimeSockets.setAuthToken(null);
      realtimeSockets.disconnectAll();
      return;
    }

    const token = authStorage.getAccessToken();
    realtimeSockets.setAuthToken(token);
    realtimeSockets.connectAll();

    return () => {
      realtimeSockets.disconnectAll();
    };
  }, [isAuthenticated]);
};
