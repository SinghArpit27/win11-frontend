import { useEffect, useRef, useState } from 'react';

import { socketClient, type Socket } from '@services/socket';

interface UseSocketOptions {
  /** Auto-connect on mount. Defaults to `true`. */
  autoConnect?: boolean;
}

/**
 * Hook entry point for components that need a live socket reference.
 * Returns the underlying `Socket` along with a reactive `connected` flag
 * so UI can render connection state without prop-drilling.
 *
 * Per-event listeners should be installed by the calling component and
 * cleaned up on unmount — this hook does NOT manage app-specific event
 * subscriptions (that belongs to feature slices).
 */
export const useSocket = ({ autoConnect = true }: UseSocketOptions = {}): {
  socket: Socket;
  connected: boolean;
} => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(() => socketClient.isConnected());

  if (!socketRef.current) {
    socketRef.current = socketClient.init();
  }

  useEffect(() => {
    const s = socketRef.current as Socket;

    const onConnect = (): void => setConnected(true);
    const onDisconnect = (): void => setConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    if (autoConnect && !s.connected) socketClient.connect();
    setConnected(s.connected);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, [autoConnect]);

  return { socket: socketRef.current as Socket, connected };
};
