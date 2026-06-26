import { memo, useMemo } from 'react';

import { formatMoney } from '@features/wallet/wallet.utils';

import type { Contest } from '../contest.types';
import { formatPrizeCompact, isFreeContest, slabPrize, slabRankLabel } from '../contest.utils';

interface ContestDetailWinningsPanelProps {
  contest: Contest;
}

const GloryTrophyIllustration = (): JSX.Element => (
  <div className="mx-auto mt-6 flex h-[220px] w-[220px] items-end justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#b3e5fc] to-[#e1f5fe]">
    <svg viewBox="0 0 200 200" className="h-[200px] w-[200px]" aria-hidden>
      <ellipse cx="100" cy="175" rx="70" ry="12" fill="#90caf9" opacity="0.35" />
      <rect x="55" y="130" width="90" height="55" rx="8" fill="#c62828" />
      <circle cx="100" cy="95" r="28" fill="#ffccbc" />
      <path
        d="M72 55 L100 25 L128 55 L118 70 L82 70 Z"
        fill="#bdbdbd"
        stroke="#9e9e9e"
        strokeWidth="2"
      />
      <rect x="88" y="70" width="24" height="18" fill="#bdbdbd" />
      <path
        d="M55 45 L45 20 L65 35 Z M145 45 L155 20 L135 35 Z"
        fill="#e0e0e0"
        stroke="#bdbdbd"
        strokeWidth="1.5"
      />
    </svg>
  </div>
);

const ContestDetailWinningsPanelComponent = ({
  contest,
}: ContestDetailWinningsPanelProps): JSX.Element => {
  const showGloryOnly = contest.isPractice || isFreeContest(contest);

  const slabs = useMemo(
    () =>
      contest.prizeSnapshot.slabs.map((slab) => ({
        key: `${slab.fromRank}-${slab.toRank}`,
        label: slabRankLabel(slab),
        amount: slabPrize(slab, contest.prizeSnapshot.poolAmount),
        bonus: slab.bonusLabel,
      })),
    [contest.prizeSnapshot],
  );

  if (showGloryOnly) {
    return (
      <div className="flex flex-col items-center px-4 pb-10 pt-8 text-center">
        <div className="flex w-full max-w-[280px] items-center gap-3">
          <span className="h-px flex-1 bg-[#e0e0e0]" aria-hidden />
          <span className="text-[15px] font-bold" style={{ color: '#212121' }}>
            Rank 1
          </span>
          <span className="h-px flex-1 bg-[#e0e0e0]" aria-hidden />
        </div>
        <p className="mt-2 text-[12px]" style={{ color: '#757575' }}>
          Winner takes all the glory!
        </p>
        <GloryTrophyIllustration />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 pb-6">
      {slabs.map((slab, index) => (
        <div
          key={slab.key}
          className="flex items-center justify-between border-b px-4 py-3.5"
          style={{ borderColor: '#eeeeee' }}
        >
          <div className="min-w-0 text-left">
            <p className="text-[13px] font-bold" style={{ color: '#212121' }}>
              {slab.label}
            </p>
            {slab.bonus ? (
              <p className="mt-0.5 text-[11px]" style={{ color: '#757575' }}>
                {slab.bonus}
              </p>
            ) : null}
            {index === 0 ? (
              <p className="mt-1 text-[11px]" style={{ color: '#757575' }}>
                Winner takes all the glory!
              </p>
            ) : null}
          </div>
          <p className="shrink-0 text-[13px] font-bold tabular-nums" style={{ color: '#212121' }}>
            {formatMoney(slab.amount, { currency: contest.currency })}
          </p>
        </div>
      ))}
      {contest.prizePoolAmount > 0 ? (
        <p className="px-4 pt-3 text-center text-[11px]" style={{ color: '#9e9e9e' }}>
          Total prize pool {formatPrizeCompact(contest.prizePoolAmount, contest.currency)}
        </p>
      ) : null}
    </div>
  );
};

export const ContestDetailWinningsPanel = memo(ContestDetailWinningsPanelComponent);
