import { io, type ManagerOptions, type Socket, type SocketOptions } from 'socket.io-client';

import { appConfig } from '@config/index';
import { logger } from '@utils/logger';

/**
 * Lazy, singleton Socket.io client. We:
 *  - keep a single connection across the app lifecycle,
 *  - avoid auto-connecting on import (caller decides when to connect),
 *  - support `setAuthToken()` so PHASE 2 (auth) can inject JWT without
 *    rewriting consumers.
 *
 * Real subscription to events is done via `useSocket` (PHASE 1 hook) or
 * feature slices that need server-pushed state.
 */
class SocketClient {
  private socket: Socket | null = null;
  private authToken: string | null = null;

  private get options(): Partial<ManagerOptions & SocketOptions> {
    return {
      path: appConfig.socket.path,
      transports: appConfig.socket.transports,
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    };
  }

  /** Initialise the underlying socket (idempotent). */
  init(): Socket {
    if (this.socket) return this.socket;

    this.socket = io(appConfig.socket.url, {
      ...this.options,
      auth: (cb) => cb(this.authToken ? { token: this.authToken } : {}),
    });

    this.socket.on('connect', () =>
      logger.info('socket connected', { id: this.socket?.id }),
    );
    this.socket.on('disconnect', (reason) => logger.info('socket disconnected', { reason }));
    this.socket.on('connect_error', (err) =>
      logger.warn('socket connect_error', { message: err.message }),
    );

    return this.socket;
  }

  connect(): Socket {
    const s = this.init();
    if (!s.connected) s.connect();
    return s;
  }

  disconnect(): void {
    this.socket?.disconnect();
  }

  destroy(): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
    if (this.socket) {
      this.socket.auth = token ? { token } : {};
      if (this.socket.connected) {
        this.socket.disconnect().connect();
      }
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

export const socketClient = new SocketClient();
export type { Socket };
