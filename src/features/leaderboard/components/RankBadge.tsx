import { memo } from 'react';

import { Typography } from '@components/ui';
import { cn } from '@utils/cn';

/**
 * Dream11-style rank pill.
 *
 *   Top-3 → gold/silver/bronze gradient + medal glyph
 *   Top-100 → primary outline
 *   Other  → neutral chip
 *
 *  Used on every row of the leaderboard table; pure + memoised so
 *  list re-renders only re-paint changed rows.
 */
interface RankBadgeProps {
  rank: number;
  className?: string;
  size?: 'sm' | 'md';
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

const RankBadgeComponent = ({ rank, className, size = 'md' }: RankBadgeProps): JSX.Element => {
  const isTop3 = rank >= 1 && rank <= 3;
  const isTop100 = rank > 3 && rank <= 100;

  const dim = size === 'sm' ? 'h-6 min-w-[28px] px-1.5 text-[11px]' : 'h-8 min-w-[36px] px-2 text-xs';

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center gap-0.5 rounded-full font-bold tabular-nums',
        dim,
        isTop3 &&
          'bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-white shadow-sm ring-1 ring-white/40',
        !isTop3 && isTop100 && 'bg-primary/10 text-primary ring-1 ring-primary/20',
        !isTop3 && !isTop100 && 'bg-bg-elevated text-text-muted ring-1 ring-border',
        className,
      )}
      aria-label={`Rank ${rank}`}
    >
      {isTop3 ? (
        <span aria-hidden>{MEDAL[rank]}</span>
      ) : (
        <Typography variant="caption" className="font-bold leading-none">
          #{rank}
        </Typography>
      )}
    </div>
  );
};

export const RankBadge = memo(RankBadgeComponent);
RankBadge.displayName = 'RankBadge';
