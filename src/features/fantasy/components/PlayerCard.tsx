import { memo } from 'react';

import { cn } from '@utils/cn';

import type { FantasyMatchPlayer } from '../fantasy.types';

/**
 * `PlayerCard` — single player row used by the create-team listing and
 * the captain selection screen.
 *
 * Variants:
 *  - `default` — list row with selection toggle (used in player listing)
 *  - `captain` — radio-style row with C / VC pickers (captain screen)
 *
 * Always responsive: stacks vertically on tight widths, switches to a
 * compact horizontal layout from sm+.
 */
interface PlayerCardBaseProps {
  player: FantasyMatchPlayer;
  className?: string;
}

interface PlayerCardListProps extends PlayerCardBaseProps {
  variant?: 'default';
  isSelected: boolean;
  onToggle: (playerId: string) => void;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  disabled?: boolean;
}

interface PlayerCardCaptainProps extends PlayerCardBaseProps {
  variant: 'captain';
  isCaptain: boolean;
  isViceCaptain: boolean;
  onSetCaptain: (playerId: string) => void;
  onSetViceCaptain: (playerId: string) => void;
  captainMultiplier: number;
  viceCaptainMultiplier: number;
}

type PlayerCardProps = PlayerCardListProps | PlayerCardCaptainProps;

const initialsOf = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
};

const PlayerAvatar = ({ player }: { player: FantasyMatchPlayer }) => {
  const teamColor = player.team?.primaryColor ?? undefined;
  return (
    <div
      className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-elevated text-xs font-bold uppercase tracking-wide text-text"
      style={
        teamColor
          ? {
              backgroundImage: `linear-gradient(135deg, ${teamColor}aa 0%, ${teamColor}33 100%)`,
              boxShadow: `inset 0 0 0 1px ${teamColor}55`,
            }
          : undefined
      }
    >
      {player.photoUrl ? (
        <img
          src={player.photoUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="relative drop-shadow-sm">{initialsOf(player.name)}</span>
      )}
    </div>
  );
};

const MetaPills = ({
  player,
  isCaptain,
  isViceCaptain,
}: {
  player: FantasyMatchPlayer;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted">
      {player.team ? (
        <span className="rounded bg-surface-elevated px-1.5 py-0.5 font-semibold uppercase tracking-wide">
          {player.team.shortName}
        </span>
      ) : null}
      {player.selectionPercent !== null ? (
        <span>Sel by {player.selectionPercent}%</span>
      ) : null}
      {player.isInLineup === true ? (
        <span className="rounded bg-success/15 px-1.5 py-0.5 font-semibold uppercase tracking-wide text-success">
          Playing
        </span>
      ) : player.isInLineup === false ? (
        <span className="rounded bg-warning/15 px-1.5 py-0.5 font-semibold uppercase tracking-wide text-warning">
          Not playing
        </span>
      ) : null}
      {isCaptain ? (
        <span className="rounded-full bg-primary px-2 py-0.5 font-bold uppercase tracking-wide text-primary-foreground">
          C
        </span>
      ) : null}
      {isViceCaptain ? (
        <span className="rounded-full bg-accent px-2 py-0.5 font-bold uppercase tracking-wide text-primary-foreground">
          VC
        </span>
      ) : null}
    </div>
  );
};

const PlayerCardComponent = (props: PlayerCardProps): JSX.Element => {
  const { player, className } = props;

  if (props.variant === 'captain') {
    const { isCaptain, isViceCaptain, onSetCaptain, onSetViceCaptain, captainMultiplier, viceCaptainMultiplier } =
      props;
    return (
      <div
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors',
          className,
        )}
      >
        <PlayerAvatar player={player} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-text">{player.name}</div>
          <MetaPills player={player} />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSetCaptain(player.id)}
            aria-pressed={isCaptain}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold transition-colors',
              isCaptain
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-surface-elevated text-text hover:border-primary hover:text-primary',
            )}
          >
            {captainMultiplier}x
          </button>
          <button
            type="button"
            onClick={() => onSetViceCaptain(player.id)}
            aria-pressed={isViceCaptain}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold transition-colors',
              isViceCaptain
                ? 'border-accent bg-accent text-primary-foreground'
                : 'border-border bg-surface-elevated text-text hover:border-accent hover:text-accent',
            )}
          >
            {viceCaptainMultiplier}x
          </button>
        </div>
      </div>
    );
  }

  const { isSelected, onToggle, isCaptain, isViceCaptain, disabled } = props;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(player.id)}
      aria-pressed={isSelected}
      className={cn(
        'group flex w-full items-center gap-3 rounded-xl border bg-surface p-3 text-left transition-colors',
        'hover:border-border-strong hover:bg-surface-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isSelected ? 'border-primary bg-primary-soft/40' : 'border-border',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <PlayerAvatar player={player} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-text">{player.name}</span>
          <span className="shrink-0 text-sm font-bold text-text">
            {player.credits.toFixed(1)}
            <span className="ml-0.5 text-[10px] font-medium uppercase tracking-wider text-text-muted">
              cr
            </span>
          </span>
        </div>
        <MetaPills player={player} isCaptain={isCaptain} isViceCaptain={isViceCaptain} />
      </div>
      <span
        aria-hidden
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors',
          isSelected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-surface-elevated text-text-muted group-hover:border-primary group-hover:text-primary',
        )}
      >
        {isSelected ? '−' : '+'}
      </span>
    </button>
  );
};

export const PlayerCard = memo(PlayerCardComponent);
