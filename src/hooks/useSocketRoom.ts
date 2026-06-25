import { useEffect } from 'react';

import type { SocketNamespace } from '@shared/enums';
import { realtimeSockets } from '@services/socket/realtime.client';

/**
 * Joins a Socket.io room on mount and leaves on unmount.
 * Used by contest/leaderboard screens for scoped live updates.
 */
export const useSocketRoom = (namespace: SocketNamespace, room: string | null | undefined): void => {
  useEffect(() => {
    if (!room) return;

    realtimeSockets.joinRoom(namespace, room);
    return () => {
      realtimeSockets.leaveRoom(namespace, room);
    };
  }, [namespace, room]);
};
