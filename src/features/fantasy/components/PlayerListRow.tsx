import { Minus, Plus } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

import { CREATE_TEAM_COLORS, CREATE_TEAM_LAYOUT } from '../fantasy.create-team.tokens';
import type { FantasyMatchPlayer } from '../fantasy.types';

interface PlayerListRowProps {
  player: FantasyMatchPlayer;
  isSelected: boolean;
  onToggle: (playerId: string) => void;
  disabled?: boolean;
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
  ALL_ROUNDER: 'ALL',
  BATSMAN: 'BAT',
  BOWLER: 'BOWL',
  GOALKEEPER: 'GK',
  DEFENDER: 'DEF',
  MIDFIELDER: 'MID',
  FORWARD: 'FWD',
};

const roleW = 'w-[14px]';
const avatarW = 'w-10';
const actionW = 'w-[30px]';

/** Outlined +/- — small circle, bold ring, no fill. */
const PlayerToggleIcon = ({
  isSelected,
  muted,
}: {
  isSelected: boolean;
  muted?: boolean;
}): JSX.Element => {
  const color = muted
    ? '#b0bec5'
    : isSelected
      ? CREATE_TEAM_COLORS.minus
      : CREATE_TEAM_COLORS.plus;
  const { actionIconSizePx, actionIconBorderPx, actionIconStroke } = CREATE_TEAM_LAYOUT;
  const glyph = actionIconSizePx * 0.45;

  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: actionIconSizePx,
        height: actionIconSizePx,
        border: `${actionIconBorderPx}px solid ${muted ? '#cfd8dc' : color}`,
        backgroundColor: CREATE_TEAM_COLORS.white,
        color: muted ? '#b0bec5' : color,
      }}
    >
      {isSelected ? (
        <Minus style={{ width: glyph, height: glyph }} strokeWidth={actionIconStroke} />
      ) : (
        <Plus style={{ width: glyph, height: glyph }} strokeWidth={actionIconStroke} />
      )}
    </span>
  );
};

const PlayerListRowComponent = ({
  player,
  isSelected,
  onToggle,
  disabled,
  captainBadge,
  className,
}: PlayerListRowProps): JSX.Element => {
  const rolePill = ROLE_SHORT[player.role] ?? player.role;
  const displayName = player.shortName ?? player.name;
  const selValue =
    player.selectionPercent !== null ? `${player.selectionPercent.toFixed(2)}%` : '—';
  const creditsLabel = Number.isInteger(player.credits)
    ? String(player.credits)
    : player.credits.toFixed(1);
  const iconMuted = Boolean(disabled && !isSelected);
  const { rowMinHeightPx, rowPaddingX, rowPaddingY, rowGapPx } = CREATE_TEAM_LAYOUT;

  return (
    <button
      type="button"
      onClick={() => onToggle(player.id)}
      disabled={disabled}
      aria-pressed={isSelected}
      aria-label={`${isSelected ? 'Remove' : 'Add'} ${player.name}`}
      className={cn(
        'flex w-full min-w-0 items-center border-b',
        'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e53935]/20',
        disabled && 'cursor-not-allowed opacity-50',
        !isSelected && 'hover:bg-[#fafafa]',
        className,
      )}
      style={{
        minHeight: rowMinHeightPx,
        paddingLeft: rowPaddingX,
        paddingRight: rowPaddingX,
        paddingTop: rowPaddingY,
        paddingBottom: rowPaddingY,
        gap: rowGapPx,
        borderColor: CREATE_TEAM_COLORS.divider,
        backgroundColor: isSelected ? CREATE_TEAM_COLORS.selectedRowBg : CREATE_TEAM_COLORS.white,
      }}
    >
      {/* Vertical role label — far left gutter */}
      <span
        className={cn(roleW, 'shrink-0 self-center text-center font-bold uppercase leading-none')}
        style={{
          fontSize: CREATE_TEAM_LAYOUT.roleFontPx,
          color: CREATE_TEAM_COLORS.roleText,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
        }}
      >
        {rolePill}
      </span>

      {/* Avatar */}
      <div
        className={cn('relative shrink-0 self-center')}
        style={{ width: CREATE_TEAM_LAYOUT.avatarPx, height: CREATE_TEAM_LAYOUT.avatarPx }}
      >
        <div
          className="flex h-full w-full items-center justify-center overflow-hidden rounded-full"
          style={{
            backgroundColor: CREATE_TEAM_COLORS.avatarBg,
            boxShadow: `inset 0 0 0 1px ${CREATE_TEAM_COLORS.avatarRing}`,
          }}
        >
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="font-bold uppercase"
              style={{ fontSize: 9, color: '#90a4ae' }}
            >
              {initialsOf(player.name)}
            </span>
          )}
        </div>
        {captainBadge ? (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#212121] text-[5px] font-bold text-white ring-1 ring-white">
            {captainBadge}
          </span>
        ) : null}
      </div>

      {/* Name + selection % — % Sel By sits directly under name */}
      <div className="min-w-0 flex-1 self-center overflow-hidden text-left">
        <p
          className="truncate font-bold leading-[14px]"
          style={{
            fontSize: CREATE_TEAM_LAYOUT.nameFontPx,
            color: CREATE_TEAM_COLORS.nameText,
          }}
          title={displayName}
        >
          {displayName}
        </p>
        <p
          className="mt-[3px] tabular-nums leading-[12px]"
          style={{
            fontSize: CREATE_TEAM_LAYOUT.selFontPx,
            fontWeight: 400,
            color: CREATE_TEAM_COLORS.selText,
          }}
        >
          {selValue}
        </p>
      </div>

      {/* Credits under +/- icon */}
      <div className={cn('flex shrink-0 flex-col items-center self-center', actionW)}>
        <PlayerToggleIcon isSelected={isSelected} muted={iconMuted} />
        <span
          className="mt-[3px] font-bold tabular-nums leading-none"
          style={{
            fontSize: CREATE_TEAM_LAYOUT.creditsFontPx,
            color: CREATE_TEAM_COLORS.creditsText,
          }}
        >
          {creditsLabel}
        </span>
      </div>
    </button>
  );
};

export const PlayerListRow = memo(PlayerListRowComponent);

/** Column sub-header — % Sel By over name block, Credits over action block. */
export const SplitPlayerColumnHeader = ({ className }: { className?: string }): JSX.Element => (
  <div
    className={cn('flex items-end', className)}
    style={{
      gap: CREATE_TEAM_LAYOUT.rowGapPx,
      paddingLeft: CREATE_TEAM_LAYOUT.rowPaddingX,
      paddingRight: CREATE_TEAM_LAYOUT.rowPaddingX,
      paddingTop: 6,
      paddingBottom: 10,
      backgroundColor: CREATE_TEAM_COLORS.columnHeaderBg,
      color: CREATE_TEAM_COLORS.columnHeaderText,
      fontSize: CREATE_TEAM_LAYOUT.columnHeaderFontPx,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
    }}
  >
    <span className={cn(roleW, 'shrink-0')} aria-hidden />
    <span className={cn(avatarW, 'shrink-0')} aria-hidden />
    <span className="min-w-0 flex-1">% Sel By</span>
    <span className={cn(actionW, 'shrink-0 text-center')}>Credits</span>
  </div>
);

export const PLAYER_ROW_GRID_CLASS = '';

export { roleW as SPLIT_PLAYER_ROLE_W, avatarW as SPLIT_PLAYER_AVATAR_W, actionW as SPLIT_PLAYER_ACTION_W };
