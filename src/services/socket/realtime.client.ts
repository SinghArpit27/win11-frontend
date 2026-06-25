import { io, type ManagerOptions, type Socket, type SocketOptions } from 'socket.io-client';

import { appConfig } from '@config/index';
import { SocketEvent, SocketNamespace } from '@shared/enums';
import { logger } from '@utils/logger';

const REALTIME_NAMESPACES: SocketNamespace[] = [
  SocketNamespace.ROOT,
  SocketNamespace.MATCHES,
  SocketNamespace.LEADERBOARDS,
  SocketNamespace.WALLETS,
  SocketNamespace.NOTIFICATIONS,
  SocketNamespace.ADMIN,
];

/**
 * Manages authenticated Socket.io connections across all realtime namespaces.
 * One manager instance keeps auth + reconnect behaviour consistent app-wide.
 */
class RealtimeSocketManager {
  private sockets = new Map<SocketNamespace, Socket>();
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

  private buildUrl(namespace: SocketNamespace): string {
    const base = appConfig.socket.url.replace(/\/$/, '');
    return namespace === SocketNamespace.ROOT ? base : `${base}${namespace}`;
  }

  getNamespace(namespace: SocketNamespace): Socket {
    const existing = this.sockets.get(namespace);
    if (existing) return existing;

    const socket = io(this.buildUrl(namespace), {
      ...this.options,
      auth: (cb) => cb(this.authToken ? { token: this.authToken } : {}),
    });

    socket.on('connect', () =>
      logger.info('realtime socket connected', { namespace, id: socket.id }),
    );
    socket.on('disconnect', (reason) =>
      logger.info('realtime socket disconnected', { namespace, reason }),
    );
    socket.on('connect_error', (err) =>
      logger.warn('realtime socket connect_error', { namespace, message: err.message }),
    );

    this.sockets.set(namespace, socket);
    return socket;
  }

  connectAll(): void {
    REALTIME_NAMESPACES.forEach((ns) => {
      const socket = this.getNamespace(ns);
      if (!socket.connected) socket.connect();
    });
  }

  disconnectAll(): void {
    this.sockets.forEach((socket) => socket.disconnect());
  }

  destroyAll(): void {
    this.sockets.forEach((socket) => {
      socket.removeAllListeners();
      socket.disconnect();
    });
    this.sockets.clear();
  }

  setAuthToken(token: string | null): void {
    this.authToken = token;
    this.sockets.forEach((socket) => {
      socket.auth = token ? { token } : {};
      if (socket.connected) {
        socket.disconnect().connect();
      }
    });
  }

  joinRoom(namespace: SocketNamespace, room: string): void {
    this.getNamespace(namespace).emit(SocketEvent.JOIN_ROOM, room);
  }

  leaveRoom(namespace: SocketNamespace, room: string): void {
    this.getNamespace(namespace).emit(SocketEvent.LEAVE_ROOM, room);
  }

  isAnyConnected(): boolean {
    for (const socket of this.sockets.values()) {
      if (socket.connected) return true;
    }
    return false;
  }
}

export const realtimeSockets = new RealtimeSocketManager();
