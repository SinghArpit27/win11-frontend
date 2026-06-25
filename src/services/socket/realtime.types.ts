import type { NotificationType, RealtimeEvent } from '@shared/enums';

/** Target routing for a realtime envelope (mirrors backend contract). */
export type RealtimeTarget =
  | { kind: 'user'; userId: string }
  | { kind: 'room'; room: string }
  | { kind: 'broadcast' };

/** Versioned wire envelope from Socket.io. */
export interface RealtimeEnvelope<TPayload = Record<string, unknown>> {
  v: 1;
  id: string;
  event: RealtimeEvent;
  target: RealtimeTarget;
  payload: TPayload;
  occurredAt: string;
  correlationId?: string;
}

export interface WalletEventPayload {
  userId: string;
  currency: string;
  spendable: number;
  locked: number;
  amount?: number;
  referenceType?: string | null;
  referenceId?: string | null;
}

export interface NotificationNewPayload {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
}

export interface ContestJoinedPayload {
  contestId: string;
  matchId: string;
  userId: string;
  entryId: string;
  filledSpots: number;
  totalSpots: number;
}

export interface LeaderboardUpdatedPayload {
  contestId: string;
  matchId: string;
  totalEntries: number;
  topScore: number;
}
