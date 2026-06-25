import { RankMovement } from '@shared/enums';

import { formatPrizeCompact } from '@features/contests/contest.utils';

/**
 * Pure presentation helpers shared across leaderboard screens / cards.
 * Centralised so every screen renders identical numbers + tone classes.
 */

export const MOVEMENT_META: Record<
  RankMovement,
  { label: string; tone: 'success' | 'danger' | 'neutral' | 'primary'; arrow: '↑' | '↓' | '–' | '★' }
> = {
  [RankMovement.UP]: { label: 'Up', tone: 'success', arrow: '↑' },
  [RankMovement.DOWN]: { label: 'Down', tone: 'danger', arrow: '↓' },
  [RankMovement.SAME]: { label: 'No change', tone: 'neutral', arrow: '–' },
  [RankMovement.NEW]: { label: 'New', tone: 'primary', arrow: '★' },
};

/**
 * Rank → ordinal suffix.
 *  1   → 1st
 *  22  → 22nd
 *  103 → 103rd
 */
export const formatRankOrdinal = (rank: number): string => {
  const safe = Math.max(0, Math.floor(rank));
  if (safe === 0) return '—';
  const lastTwo = safe % 100;
  const lastOne = safe % 10;
  if (lastTwo >= 11 && lastTwo <= 13) return `${safe}th`;
  if (lastOne === 1) return `${safe}st`;
  if (lastOne === 2) return `${safe}nd`;
  if (lastOne === 3) return `${safe}rd`;
  return `${safe}th`;
};

/**
 * Fantasy points are quantised to 2 decimals by the backend, so we keep
 * the same precision on the wire and only trim trailing zeros for
 * compact rendering (3.0 → 3).
 */
export const formatPoints = (points: number): string => {
  if (!Number.isFinite(points)) return '0';
  const rounded = Math.round(points * 100) / 100;
  if (Number.isInteger(rounded)) return rounded.toLocaleString('en-IN');
  return rounded.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatWinning = (minor: number | null, currency = 'INR'): string => {
  if (minor === null || minor <= 0) return '—';
  return formatPrizeCompact(minor, currency);
};

/**
 * "1 (↑3)" / "2 (NEW)" / "5 (—)" — used on the user rank widget.
 */
export const formatRankWithMovement = (
  rank: number | null,
  movement: RankMovement,
  delta: number,
): string => {
  if (rank === null || rank === 0) return '—';
  const meta = MOVEMENT_META[movement];
  if (movement === RankMovement.NEW) return `#${rank} (NEW)`;
  if (movement === RankMovement.SAME || delta === 0) return `#${rank}`;
  return `#${rank} (${meta.arrow}${Math.abs(delta)})`;
};

/**
 * Cap to top-N for "you ranked in top X%" copy.
 */
export const percentileOf = (rank: number, total: number): number => {
  if (rank <= 0 || total <= 0) return 0;
  const pct = ((total - rank + 1) / total) * 100;
  return Math.max(0, Math.min(100, pct));
};
