import type { Dispatch } from '@reduxjs/toolkit';

import { RealtimeEvent, SocketNamespace } from '@shared/enums';
import { baseApi } from '@store/api/base.api';
import { showToast } from '@store/slices/app.slice';

import type { RealtimeEnvelope } from './realtime.types';
import { realtimeSockets } from './realtime.client';

let installed = false;

const onEnvelope =
  (dispatch: Dispatch) =>
  (envelope: RealtimeEnvelope): void => {
    switch (envelope.event) {
      case RealtimeEvent.LEADERBOARD_UPDATED:
      case RealtimeEvent.LEADERBOARD_RANK_CHANGED:
      case RealtimeEvent.LEADERBOARD_POINTS_CHANGED:
        dispatch(
          baseApi.util.invalidateTags([
            'Leaderboard',
            'UserRank',
            'RankHistory',
            { type: 'Contest', id: String(envelope.payload.contestId ?? '') },
          ]),
        );
        break;

      case RealtimeEvent.CONTEST_JOINED:
      case RealtimeEvent.CONTEST_FILLED:
      case RealtimeEvent.CONTEST_LOCKED:
      case RealtimeEvent.CONTEST_CANCELLED:
        dispatch(
          baseApi.util.invalidateTags([
            'Contest',
            'ContestEntry',
            { type: 'Contest', id: String(envelope.payload.contestId ?? '') },
          ]),
        );
        break;

      case RealtimeEvent.WALLET_UPDATED:
      case RealtimeEvent.WALLET_DEBITED:
      case RealtimeEvent.WALLET_CREDITED:
      case RealtimeEvent.DEPOSIT_COMPLETED:
        dispatch(baseApi.util.invalidateTags(['Wallet', 'Payment', 'Settlement']));
        if (
          envelope.event === RealtimeEvent.WALLET_CREDITED ||
          envelope.event === RealtimeEvent.DEPOSIT_COMPLETED
        ) {
          dispatch(
            showToast({
              message: 'Deposit completed — wallet updated',
              variant: 'success',
            }),
          );
        }
        break;

      case RealtimeEvent.WITHDRAWAL_APPROVED:
      case RealtimeEvent.WITHDRAWAL_REJECTED:
        dispatch(baseApi.util.invalidateTags(['Wallet', 'Withdrawal', 'Settlement']));
        dispatch(
          showToast({
            message:
              envelope.event === RealtimeEvent.WITHDRAWAL_APPROVED
                ? 'Withdrawal approved'
                : 'Withdrawal rejected',
            variant: envelope.event === RealtimeEvent.WITHDRAWAL_APPROVED ? 'success' : 'warning',
          }),
        );
        break;

      case RealtimeEvent.KYC_APPROVED:
      case RealtimeEvent.KYC_REJECTED:
        dispatch(baseApi.util.invalidateTags(['Kyc']));
        dispatch(
          showToast({
            message:
              envelope.event === RealtimeEvent.KYC_APPROVED
                ? 'KYC approved — withdrawals unlocked'
                : 'KYC rejected — action required',
            variant: envelope.event === RealtimeEvent.KYC_APPROVED ? 'success' : 'warning',
          }),
        );
        break;

      case RealtimeEvent.NOTIFICATION_NEW:
        dispatch(baseApi.util.invalidateTags(['Notification']));
        dispatch(
          showToast({
            message: String(envelope.payload.title ?? 'New notification'),
            variant: 'info',
          }),
        );
        break;

      case RealtimeEvent.MATCH_UPDATE:
        dispatch(
          baseApi.util.invalidateTags([
            'Match',
            { type: 'Match', id: String(envelope.payload.matchId ?? '') },
          ]),
        );
        break;

      default:
        break;
    }
  };

/**
 * Subscribes to realtime envelopes on every namespace. Idempotent — safe to
 * call from `useAuthSocketSync` on each auth transition.
 */
export const installRealtimeListeners = (dispatch: Dispatch): void => {
  if (installed) return;
  installed = true;

  const handler = onEnvelope(dispatch);
  const namespaces = [
    SocketNamespace.LEADERBOARDS,
    SocketNamespace.WALLETS,
    SocketNamespace.NOTIFICATIONS,
    SocketNamespace.MATCHES,
  ];

  namespaces.forEach((ns) => {
    const socket = realtimeSockets.getNamespace(ns);
    Object.values(RealtimeEvent).forEach((eventName) => {
      socket.on(eventName, handler);
    });
  });
};

export const resetRealtimeListenersForTests = (): void => {
  installed = false;
};
