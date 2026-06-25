import { CircleMinus, CirclePlus } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

import type { FantasyMatchPlayer } from '../fantasy.types';

/**
 * Dense row for the split two-column player picker.
 * Uses theme tokens so light / dark / system modes stay readable.
 */
interface PlayerListRowProps {
  player: FantasyMatchPlayer;
  isSelected: boolean;
  onToggle: (playerId: string) => void;
  disabled?: boolean;
  align?: 'left' | 'right';
  /** Secondary stat label below the name. Defaults to `sel by`. */
  primaryStatLabel?: string;
  primaryStatValue?: string;
  /** Trailing numeric (credits / points). */
  secondaryValue?: string;
  captainBadge?: 'C' | 'VC' | null;
  className?: string;
}

const initialsOf = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
};

const ROLE_SHORT: Record<string, string> = {
  WICKET_KEEPER: 'WK',
  BATSMAN: 'BAT',
  ALL_ROUNDER: 'ALL',
  BOWLER: 'BOWL',
  GOALKEEPER: 'GK',
  DEFENDER: 'DEF',
  MIDFIELDER: 'MID',
  FORWARD: 'FWD',
};

const PlayerListRowComponent = ({
  player,
  isSelected,
  onToggle,
  disabled,
  align = 'left',
  primaryStatLabel = 'sel by',
  primaryStatValue,
  secondaryValue,
  captainBadge,
  className,
}: PlayerListRowProps): JSX.Element => {
  const teamColor = player.team?.primaryColor ?? 'var(--w11-color-text-muted)';
  const rolePill = ROLE_SHORT[player.role] ?? player.role;
  const selValue =
    primaryStatValue ??
    (player.selectionPercent !== null ? `${player.selectionPercent.toFixed(1)}%` : '—');

  return (
    <button
      type="button"
      onClick={() => onToggle(player.id)}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={`${isSelected ? 'Remove' : 'Add'} ${player.name}`}
      className={cn(
        'group flex w-full min-h-[72px] items-center gap-2 border-b border-border px-1.5 py-2 text-left transition-colors',
        'bg-surface hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset',
        isSelected && 'bg-primary-soft/50 ring-1 ring-inset ring-primary/25',
        disabled && 'cursor-not-allowed opacity-50',
        align === 'right' && 'flex-row-reverse text-right',
        className,
      )}
    >
      <div className="relative flex shrink-0 flex-col items-center gap-0.5">
        <div
          className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface-elevated text-[10px] font-bold uppercase tracking-wide text-text ring-2 ring-border"
          style={{ boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${teamColor} 55%, transparent)` }}
        >
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span>{initialsOf(player.name)}</span>
          )}
          {captainBadge ? (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-text text-[9px] font-bold text-bg shadow ring-2 ring-surface">
              {captainBadge}
            </span>
          ) : null}
        </div>
        <span
          className="max-w-[62px] truncate rounded-sm px-1 py-px text-[8px] font-bold uppercase tracking-wide text-text-inverse"
          style={{ backgroundColor: teamColor }}
          title={`${player.team?.shortName ?? '—'} ${rolePill}`}
        >
          {player.team?.shortName ?? '—'} {rolePill}
        </span>
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5', align === 'right' && 'items-end')}>
        <div
          className="w-full truncate text-sm font-bold leading-tight text-text"
          title={player.name}
        >
          {player.shortName ?? player.name}
        </div>
        <div className="truncate text-[11px] text-text-muted">
          <span className="font-semibold tabular-nums text-text">{selValue}</span>
          {primaryStatLabel ? <span className="ml-1 lowercase">{primaryStatLabel}</span> : null}
        </div>
      </div>

      {secondaryValue !== undefined ? (
        <div className={cn('flex shrink-0 flex-col items-end', align === 'right' && 'items-start')}>
          <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
            cr
          </span>
          <span className="text-sm font-bold tabular-nums text-text">{secondaryValue}</span>
        </div>
      ) : null}

      <span
        aria-hidden
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors',
          isSelected ? 'text-danger' : 'text-success group-disabled:text-text-muted',
        )}
      >
        {isSelected ? (
          <CircleMinus className="h-[22px] w-[22px]" strokeWidth={2} />
        ) : (
          <CirclePlus className="h-[22px] w-[22px]" strokeWidth={2} />
        )}
      </span>
    </button>
  );
};

export const PlayerListRow = memo(PlayerListRowComponent);
