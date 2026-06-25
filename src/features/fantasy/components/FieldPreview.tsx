import { Trophy } from 'lucide-react';
import { memo, useMemo } from 'react';

import { PlayerRole } from '@shared/enums';

import { cn } from '@utils/cn';

import type { FantasyMatchPlayer } from '../fantasy.types';

/**
 * Dream11-style cricket ground team preview.
 *
 *  Visual reference (Dream11 / My11Circle preview):
 *   - Full-bleed cricket ground: concentric circle markings on a green
 *     pitch with darker grass-mow stripes and a centred brown pitch
 *     strip with crease lines.
 *   - Two faint trophy watermarks at the left/right edges.
 *   - Players arranged in 4 horizontal role bands: WK · BAT · AR · BOWL
 *     (or GK · DEF · MID · FWD for football).
 *   - Each player is rendered as a 56 px circular photo with a white
 *     border + soft drop shadow, a dark name pill underneath, and a
 *     small "8.5 Cr" line for credits.
 *   - C / VC badge sits at the top-right of the avatar as a small black
 *     circle with the role letter, exactly like the reference.
 *
 *  All chrome (header / actions) is owned by the parent screen — this
 *  component is purely the field surface.
 */
interface FieldPreviewPlayer {
  player: FantasyMatchPlayer;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

interface FieldPreviewProps {
  players: FieldPreviewPlayer[];
  /** Optional empty-state CTA (e.g. "START SELECTING"). */
  emptyAction?: React.ReactNode;
  className?: string;
}

const ROLE_ROWS: Array<{ role: PlayerRole; label: string }> = [
  { role: PlayerRole.WICKET_KEEPER, label: 'WICKET-KEEPERS' },
  { role: PlayerRole.BATSMAN, label: 'BATTERS' },
  { role: PlayerRole.ALL_ROUNDER, label: 'ALL-ROUNDERS' },
  { role: PlayerRole.BOWLER, label: 'BOWLERS' },
  // Football fallback rows — kept so the same surface works for both
  // sports without duplicating logic.
  { role: PlayerRole.GOALKEEPER, label: 'GOALKEEPERS' },
  { role: PlayerRole.DEFENDER, label: 'DEFENDERS' },
  { role: PlayerRole.MIDFIELDER, label: 'MIDFIELDERS' },
  { role: PlayerRole.FORWARD, label: 'FORWARDS' },
];

const initialsOf = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
};

const FieldPreviewComponent = ({
  players,
  emptyAction,
  className,
}: FieldPreviewProps): JSX.Element => {
  const byRole = useMemo(() => {
    const map = new Map<PlayerRole, FieldPreviewPlayer[]>();
    for (const entry of players) {
      const role = entry.player.role ?? PlayerRole.UNKNOWN;
      const arr = map.get(role) ?? [];
      arr.push(entry);
      map.set(role, arr);
    }
    return map;
  }, [players]);

  const rowsToRender = ROLE_ROWS.filter((row) => (byRole.get(row.role)?.length ?? 0) > 0);
  const isEmpty = players.length === 0;

  return (
    <div
      className={cn(
        'relative flex w-full flex-1 flex-col overflow-hidden',
        'min-h-[520px]',
        className,
      )}
    >
      <GroundBackground />

      <div className="relative flex flex-1 flex-col justify-around gap-3 px-2 py-4 sm:px-3">
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="rounded-xl bg-black/45 px-5 py-4 text-center backdrop-blur-sm">
              <div className="text-sm font-semibold text-white">No players selected yet</div>
              {emptyAction ? <div className="mt-3">{emptyAction}</div> : null}
            </div>
          </div>
        ) : (
          rowsToRender.map((row) => {
            const list = byRole.get(row.role) ?? [];
            return (
              <div key={row.role} className="flex flex-col items-center gap-1.5">
                <span className="rounded-full border border-white/20 bg-surface/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-text shadow-sm">
                  {row.label}
                </span>
                <div className="flex flex-wrap justify-center gap-x-2 gap-y-2.5 sm:gap-x-3">
                  {list.map(({ player, isCaptain, isViceCaptain }) => (
                    <FieldChip
                      key={player.id}
                      player={player}
                      isCaptain={isCaptain}
                      isViceCaptain={isViceCaptain}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Internal — single player chip ────────────────────────────────────
const FieldChip = ({
  player,
  isCaptain,
  isViceCaptain,
}: {
  player: FantasyMatchPlayer;
  isCaptain: boolean;
  isViceCaptain: boolean;
}): JSX.Element => {
  const badge = isCaptain ? 'C' : isViceCaptain ? 'VC' : null;
  return (
    <div className="flex w-[68px] flex-col items-center sm:w-[76px]">
      <div className="relative">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#11331f] ring-2 ring-white/90 shadow-md sm:h-[52px] sm:w-[52px]">
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-bold uppercase tracking-wide text-white">
              {initialsOf(player.name)}
            </span>
          )}
        </div>
        {badge ? (
          <span
            className={cn(
              'absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full text-[9px] font-extrabold leading-none shadow ring-2 ring-white',
              badge === 'C' ? 'bg-white text-text' : 'bg-text text-bg',
            )}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div
        className="mt-1 line-clamp-2 w-full min-h-[2rem] rounded-md bg-black/75 px-1 py-0.5 text-center text-[10px] font-semibold leading-tight text-white shadow-sm sm:text-[11px]"
        title={player.name}
      >
        {player.shortName ?? player.name}
      </div>
      <div className="mt-0.5 rounded bg-black/50 px-1.5 py-px text-[10px] font-semibold tabular-nums text-white">
        {player.credits.toFixed(1)} Cr
      </div>
    </div>
  );
};

// ── Internal — realistic cricket ground backdrop ─────────────────────
const GroundBackground = (): JSX.Element => (
  <div aria-hidden className="absolute inset-0 overflow-hidden">
    {/* Base radial gradient — bright field centre, darker edges */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse at 50% 45%, #2e8b57 0%, #1f6b41 45%, #103d23 100%)',
      }}
    />
    {/* Faint mowed-grass alternating stripes */}
    <div
      className="absolute inset-0 opacity-[0.12]"
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 36px, transparent 36px 72px)',
      }}
    />
    {/* Outer boundary circle */}
    <div className="absolute left-1/2 top-1/2 aspect-square w-[140%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
    {/* 30-yard inner circle */}
    <div className="absolute left-1/2 top-1/2 aspect-square w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
    {/* Pitch strip — tan/brown rectangle at centre with crease lines */}
    <div className="absolute left-1/2 top-1/2 h-[180px] w-[34px] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#c89b6c]/45 ring-1 ring-white/15 sm:h-[220px] sm:w-[40px]">
      <span className="absolute inset-x-1 top-3 h-px bg-white/55" />
      <span className="absolute inset-x-1 bottom-3 h-px bg-white/55" />
      <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-white/55" />
    </div>
    {/* Trophy watermarks — left & right, intentionally very faint */}
    <Trophy
      className="absolute left-3 top-1/2 h-16 w-16 -translate-y-1/2 text-white/[0.06]"
      strokeWidth={1.5}
    />
    <Trophy
      className="absolute right-3 top-1/2 h-16 w-16 -translate-y-1/2 text-white/[0.06]"
      strokeWidth={1.5}
    />
    {/* Soft top + bottom vignette so chips read clearly */}
    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
  </div>
);

export const FieldPreview = memo(FieldPreviewComponent);
