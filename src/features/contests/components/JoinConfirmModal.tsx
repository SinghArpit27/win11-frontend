import { AlertTriangle, CheckCircle2, Sparkles, Wallet as WalletIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Typography,
} from '@components/ui';
import { useGetMyWalletQuery } from '@features/wallet/wallet.api';
import { formatMoney, newIdempotencyKey } from '@features/wallet/wallet.utils';
import { cn } from '@utils/cn';
import { extractErrorMessage } from '@utils/errors';

import { useJoinContestMutation } from '../contest.api';
import type { ContestSummary } from '../contest.types';
import { isFreeContest } from '../contest.utils';

interface JoinConfirmModalProps {
  open: boolean;
  contest: ContestSummary | null;
  teamId: string | null;
  inviteCode?: string;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (entryId: string) => void;
}

/**
 * Join confirmation flow.
 *
 *   Phase 1 — confirmation     : breakdown of entry fee vs balance, T&Cs.
 *   Phase 2 — success screen   : entry id + cta to view my contests.
 *
 *  The mutation is fired exactly once per (contest, team, idempotencyKey)
 *  triple. The key is generated when the modal opens so a double-tap or a
 *  retry collapses to a single ledger entry on the backend.
 */
export const JoinConfirmModal = ({
  open,
  contest,
  teamId,
  inviteCode,
  onOpenChange,
  onSuccess,
}: JoinConfirmModalProps): JSX.Element | null => {
  const walletQuery = useGetMyWalletQuery(undefined, { skip: !open });
  const [join, joinState] = useJoinContestMutation();

  // Lazily generated and pinned to the lifetime of the open modal so a
  // double-tap (or a remount mid-network) still hits the same idempotency
  // key on the server.
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');
  useEffect(() => {
    if (open) {
      setIdempotencyKey(newIdempotencyKey('join'));
      joinState.reset();
    }
  }, [open, joinState]);

  const success = joinState.isSuccess && joinState.data;

  const wallet = walletQuery.data?.wallet;
  const spendable = wallet?.balances.spendable ?? 0;
  const currency = contest?.currency ?? wallet?.currency ?? 'INR';
  const entryFee = contest?.entryFee ?? 0;
  const free = contest ? isFreeContest(contest) : false;
  const insufficient = !free && spendable < entryFee;
  const shortfall = insufficient ? entryFee - spendable : 0;

  const errorMessage = useMemo<string | null>(() => {
    if (!joinState.error) return null;
    return extractErrorMessage(joinState.error);
  }, [joinState.error]);

  const handleConfirm = useCallback(async () => {
    if (!contest || !teamId || insufficient) return;
    try {
      const res = await join({
        contestId: contest.id,
        teamId,
        inviteCode,
        idempotencyKey,
      }).unwrap();
      onSuccess?.(res.entry.id);
    } catch {
      /* surfaced via joinState.error */
    }
  }, [contest, teamId, inviteCode, idempotencyKey, insufficient, join, onSuccess]);

  if (!contest) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="gap-3 sm:gap-4">
        {success ? (
          <SuccessBody
            entryFee={entryFee}
            currency={currency}
            contestName={contest.name}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <>
            <ModalHeader>
              <ModalTitle>Join {contest.name}</ModalTitle>
              <ModalDescription>
                Confirm your entry — this debits your wallet immediately.
              </ModalDescription>
            </ModalHeader>

            <div className="rounded-xl border border-border bg-surface">
              <Row
                label="Entry fee"
                value={free ? 'FREE' : formatMoney(entryFee, { currency })}
              />
              <Row
                label="Wallet balance"
                value={formatMoney(spendable, { currency })}
              />
              <Row
                label={free ? 'You pay' : 'Debit from wallet'}
                value={free ? 'FREE' : formatMoney(entryFee, { currency })}
                emphasis
              />
            </div>

            {insufficient && (
              <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <Typography variant="caption" className="text-xs font-medium">
                  Add {formatMoney(shortfall, { currency })} to your wallet to join this contest.
                </Typography>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-danger">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <Typography variant="caption" className="text-xs font-medium">
                  {errorMessage}
                </Typography>
              </div>
            )}

            <ModalFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={joinState.isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                loading={joinState.isLoading}
                disabled={joinState.isLoading || insufficient || !teamId}
                leftIcon={<WalletIcon className="h-4 w-4" />}
              >
                {free
                  ? 'Confirm Join'
                  : `Pay ${formatMoney(entryFee, { currency })} & Join`}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

// ─── Pieces ────────────────────────────────────────────────────────────

const Row = ({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}): JSX.Element => (
  <div
    className={cn(
      'flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 last:border-0',
      emphasis && 'bg-bg-elevated/40',
    )}
  >
    <Typography variant="caption" tone="muted" className="text-xs">
      {label}
    </Typography>
    <Typography
      variant="body"
      className={cn(
        'text-sm font-semibold tabular-nums',
        emphasis && 'text-base font-extrabold',
      )}
    >
      {value}
    </Typography>
  </div>
);

const SuccessBody = ({
  entryFee,
  currency,
  contestName,
  onClose,
}: {
  entryFee: number;
  currency: string;
  contestName: string;
  onClose: () => void;
}): JSX.Element => (
  <div className="flex flex-col items-center gap-3 py-3 text-center">
    <div className="relative">
      <CheckCircle2 className="h-14 w-14 text-success" aria-hidden />
      <Sparkles
        className="absolute -right-3 -top-2 h-5 w-5 animate-pulse text-warning"
        aria-hidden
      />
    </div>
    <Typography variant="h3" className="block font-extrabold">
      You're in!
    </Typography>
    <Typography variant="caption" tone="muted" className="block max-w-xs text-sm">
      You've joined <strong>{contestName}</strong>
      {entryFee > 0 && (
        <>
          {' '}
          for <strong>{formatMoney(entryFee, { currency })}</strong>
        </>
      )}
      . Good luck!
    </Typography>
    <Button variant="primary" fullWidth onClick={onClose} className="mt-2">
      Continue
    </Button>
  </div>
);
