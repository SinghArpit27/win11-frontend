import { Info } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

import type { FantasyMatchPlayer } from '../fantasy.types';

interface RolePlayerListRowProps {
  player: FantasyMatchPlayer;
  isSelected: boolean;
  onToggle: (playerId: string) => void;
  disabled?: boolean;
  pointsValue?: string;
  captainBadge?: 'C' | 'VC' | null;
  className?: string;
}

const initialsOf = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
};

/** Full-width Dream11 row used when a role tab (WK/BAT/AR/BOWL) is active. */
const RolePlayerListRowComponent = ({
  player,
  isSelected,
  onToggle,
  disabled,
  pointsValue = '0',
  captainBadge,
  className,
}: RolePlayerListRowProps): JSX.Element => {
  const displayName = player.shortName ?? player.name;
  const selLabel =
    player.selectionPercent !== null ? `${player.selectionPercent.toFixed(2)}%` : '—';
  const creditsLabel = Number.isInteger(player.credits)
    ? String(player.credits)
    : player.credits.toFixed(1);
  const teamShort = player.team?.shortName ?? '—';
  const teamColor = player.team?.primaryColor ?? '#424242';

  return (
    <button
      type="button"
      onClick={() => onToggle(player.id)}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={`${isSelected ? 'Remove' : 'Add'} ${player.name}`}
      className={cn(
        'flex w-full min-w-0 items-center gap-2 border-b border-[#eeeeee] bg-white px-3 py-2.5 text-left',
        'transition-colors hover:bg-[#fafafa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e53935]/30',
        isSelected && 'bg-[#fff8f8]',
        disabled && 'cursor-not-allowed opacity-45',
        className,
      )}
    >
      <Info className="h-4 w-4 shrink-0 text-[#bdbdbd]" aria-hidden />

      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#f0f0f0] ring-1 ring-[#e0e0e0]">
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-bold uppercase text-[#666]">
              {initialsOf(player.name)}
            </span>
          )}
        </div>
        <span
          className="absolute -bottom-1 left-0 rounded px-0.5 text-[7px] font-bold uppercase leading-tight text-white"
          style={{ backgroundColor: teamColor }}
        >
          {teamShort}
        </span>
        {captainBadge ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#212121] text-[6px] font-bold text-white ring-1 ring-white">
            {captainBadge}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold leading-tight text-[#000000]" title={displayName}>
          {displayName}
        </p>
        <p className="text-[11px] font-medium tabular-nums text-[#757575]">{selLabel}</p>
      </div>

      <span className="w-10 shrink-0 text-center text-[13px] font-semibold tabular-nums text-[#546e7a]">
        {pointsValue}
      </span>

      <span className="w-10 shrink-0 text-center text-[13px] font-bold tabular-nums text-[#000000]">
        {creditsLabel}
      </span>

      <span
        aria-hidden
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[15px] font-light leading-none text-white',
          isSelected ? 'bg-[#e53935]' : 'bg-[#43a047]',
        )}
      >
        {isSelected ? '−' : '+'}
      </span>
    </button>
  );
};

export const RolePlayerListRow = memo(RolePlayerListRowComponent);
