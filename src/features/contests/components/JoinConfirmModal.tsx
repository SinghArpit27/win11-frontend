import { AlertTriangle, CheckCircle2, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Button,
  Modal,
  ModalContent,
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
 * Come-style join confirmation — overlay on contest hub after team save.
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
  const payLabel = free ? 'FREE' : formatMoney(entryFee, { currency });

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
      <ModalContent showClose={false} className="gap-0 px-0 pb-0 pt-0 md:px-0 md:pb-0 md:pt-0">
        {success ? (
          <SuccessBody
            entryFee={entryFee}
            currency={currency}
            contestName={contest.name}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <div className="flex flex-col">
            <div className="relative border-b border-[#eeeeee] px-4 pb-4 pt-5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="absolute left-3 top-3 rounded-full p-2 text-[#757575] hover:bg-[#f5f5f5]"
              >
                <X className="h-5 w-5" />
              </button>
              <Typography
                variant="body"
                className="block text-center text-[16px] font-bold text-[#000000]"
              >
                Confirmation
              </Typography>
              <Typography
                variant="caption"
                className="mt-1 block text-center text-[13px] text-[#757575]"
              >
                Your balance: {formatMoney(spendable, { currency })}
              </Typography>
            </div>

            <div className="px-4 py-2">
              <ConfirmRow label="Entry" value={payLabel} />
              <ConfirmRow label="To Pay" value={payLabel} emphasis />
            </div>

            {insufficient && (
              <div className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-warning">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <Typography variant="caption" className="text-xs font-medium">
                  Add {formatMoney(shortfall, { currency })} to your wallet to join this contest.
                </Typography>
              </div>
            )}

            {errorMessage && (
              <div className="mx-4 mb-2 flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-danger">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <Typography variant="caption" className="text-xs font-medium">
                  {errorMessage}
                </Typography>
              </div>
            )}

            <div className="border-t border-[#eeeeee] px-4 py-4 pb-[max(env(safe-area-inset-bottom),16px)]">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={joinState.isLoading || insufficient || !teamId}
                className={cn(
                  'w-full rounded-md py-3.5 text-[14px] font-bold uppercase tracking-wide text-white transition-opacity',
                  joinState.isLoading || insufficient || !teamId
                    ? 'cursor-not-allowed bg-[#9e9e9e]'
                    : 'bg-[#1fa444] hover:opacity-95',
                )}
              >
                {joinState.isLoading ? 'Joining…' : 'Join Contest'}
              </button>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

const ConfirmRow = ({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}): JSX.Element => (
  <div className="flex items-center justify-between gap-3 py-3">
    <Typography
      variant="body"
      className={cn(
        'text-[14px]',
        emphasis ? 'font-bold text-[#000000]' : 'font-normal text-[#424242]',
      )}
    >
      {label}
    </Typography>
    <Typography
      variant="body"
      className={cn(
        'tabular-nums text-[14px] text-[#000000]',
        emphasis ? 'font-bold' : 'font-semibold',
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
  <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
    <div className="relative">
      <CheckCircle2 className="h-14 w-14 text-success" aria-hidden />
      <Sparkles
        className="absolute -right-3 -top-2 h-5 w-5 animate-pulse text-warning"
        aria-hidden
      />
    </div>
    <Typography variant="h3" className="block font-extrabold">
      You&apos;re in!
    </Typography>
    <Typography variant="caption" tone="muted" className="block max-w-xs text-sm">
      You&apos;ve joined <strong>{contestName}</strong>
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
