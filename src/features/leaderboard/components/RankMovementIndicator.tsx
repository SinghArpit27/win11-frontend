import { ArrowDown, ArrowUp, Minus, Sparkles } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

import { RankMovement } from '@shared/enums';

import { MOVEMENT_META } from '../leaderboard.utils';

/**
 * Tiny coloured arrow + delta count.
 *  ↑ 12   ↓ 4   – (no change)   ★ NEW
 *
 *  Stateless + memoised — re-renders cheap inside long lists.
 */
interface RankMovementIndicatorProps {
  movement: RankMovement;
  delta: number;
  /** When true, the delta value is hidden (used in compact rows). */
  compact?: boolean;
  className?: string;
}

const ICON: Record<RankMovement, JSX.Element> = {
  [RankMovement.UP]: <ArrowUp className="h-3 w-3" aria-hidden />,
  [RankMovement.DOWN]: <ArrowDown className="h-3 w-3" aria-hidden />,
  [RankMovement.SAME]: <Minus className="h-3 w-3" aria-hidden />,
  [RankMovement.NEW]: <Sparkles className="h-3 w-3" aria-hidden />,
};

const RankMovementIndicatorComponent = ({
  movement,
  delta,
  compact = false,
  className,
}: RankMovementIndicatorProps): JSX.Element => {
  const meta = MOVEMENT_META[movement];
  const absDelta = Math.abs(delta);
  const showDelta = !compact && movement !== RankMovement.SAME && movement !== RankMovement.NEW;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none',
        meta.tone === 'success' && 'bg-success/10 text-success',
        meta.tone === 'danger' && 'bg-danger/10 text-danger',
        meta.tone === 'primary' && 'bg-primary/10 text-primary',
        meta.tone === 'neutral' && 'bg-bg-elevated text-text-muted',
        className,
      )}
      aria-label={`${meta.label}${showDelta ? ` by ${absDelta}` : ''}`}
    >
      {ICON[movement]}
      {showDelta && <span>{absDelta}</span>}
      {compact && movement === RankMovement.NEW && <span className="font-extrabold">NEW</span>}
    </span>
  );
};

export const RankMovementIndicator = memo(RankMovementIndicatorComponent);
RankMovementIndicator.displayName = 'RankMovementIndicator';
