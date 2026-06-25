import { Info } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

import type { FantasyMatchPlayer } from '../fantasy.types';

interface CaptainListRowProps {
  player: FantasyMatchPlayer;
  isCaptain: boolean;
  isViceCaptain: boolean;
  captainMultiplier: number;
  viceCaptainMultiplier: number;
  onSetCaptain: (playerId: string) => void;
  onSetViceCaptain: (playerId: string) => void;
  pointsValue?: string;
  captainPercent?: string;
  viceCaptainPercent?: string;
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

const CaptainListRowComponent = ({
  player,
  isCaptain,
  isViceCaptain,
  captainMultiplier,
  viceCaptainMultiplier,
  onSetCaptain,
  onSetViceCaptain,
  pointsValue,
  captainPercent,
  viceCaptainPercent,
  className,
}: CaptainListRowProps): JSX.Element => {
  const teamColor = player.team?.primaryColor ?? 'var(--w11-color-text-muted)';
  const rolePill = ROLE_SHORT[player.role] ?? player.role;

  return (
    <div
      className={cn(
        'flex min-h-[76px] items-center gap-2 border-b border-border py-3 sm:gap-3',
        (isCaptain || isViceCaptain) && 'bg-primary-soft/30',
        className,
      )}
    >
      <Info className="hidden h-4 w-4 shrink-0 text-text-muted sm:block" aria-hidden />

      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <div
          className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-surface-elevated text-[11px] font-bold uppercase tracking-wide text-text ring-2 ring-border"
          style={{ boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${teamColor} 55%, transparent)` }}
        >
          {player.photoUrl ? (
            <img src={player.photoUrl} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span>{initialsOf(player.name)}</span>
          )}
        </div>
        <span
          className="max-w-[64px] truncate rounded-sm px-1 py-px text-[9px] font-bold uppercase tracking-wide text-text-inverse"
          style={{ backgroundColor: teamColor }}
        >
          {player.team?.shortName ?? '—'} {rolePill}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold text-text" title={player.name}>
          {player.shortName ?? player.name}
        </div>
        {pointsValue ? (
          <div className="mt-0.5 text-xs text-text-muted">
            <span className="font-semibold tabular-nums text-text">{pointsValue}</span>
          </div>
        ) : null}
      </div>

      <div className="flex w-[3.25rem] shrink-0 flex-col items-center gap-1 sm:w-14">
        <button
          type="button"
          onClick={() => onSetCaptain(player.id)}
          aria-pressed={isCaptain}
          aria-label={`Set ${player.shortName ?? player.name} as captain`}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            isCaptain
              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
              : 'border-border-strong bg-surface text-text hover:border-primary hover:text-primary',
          )}
        >
          {isCaptain ? `${captainMultiplier}x` : 'C'}
        </button>
        {captainPercent ? (
          <span className="text-[10px] font-medium tabular-nums text-text-muted">{captainPercent}</span>
        ) : null}
      </div>

      <div className="flex w-[3.25rem] shrink-0 flex-col items-center gap-1 sm:w-14">
        <button
          type="button"
          onClick={() => onSetViceCaptain(player.id)}
          aria-pressed={isViceCaptain}
          aria-label={`Set ${player.shortName ?? player.name} as vice-captain`}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            isViceCaptain
              ? 'border-accent bg-accent text-text-inverse shadow-sm'
              : 'border-border-strong bg-surface text-text hover:border-accent hover:text-accent',
          )}
        >
          {isViceCaptain ? `${viceCaptainMultiplier}x` : 'VC'}
        </button>
        {viceCaptainPercent ? (
          <span className="text-[10px] font-medium tabular-nums text-text-muted">{viceCaptainPercent}</span>
        ) : null}
      </div>
    </div>
  );
};

export const CaptainListRow = memo(CaptainListRowComponent);
