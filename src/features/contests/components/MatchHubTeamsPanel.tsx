import { Copy, Pencil, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import { resolveUserHandle } from '@features/auth/auth.utils';
import { useAuth } from '@features/auth/useAuth';
import type { FantasyTeam } from '@features/fantasy/fantasy.types';
import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';
import { PlayerRole } from '@shared/enums';
import { cn } from '@utils/cn';
import { buildRoute } from '@utils/routes.util';

interface MatchHubTeamsPanelProps {
  matchId: string;
  teams: FantasyTeam[];
  matchLocked?: boolean;
}

const CRICKET_ROLE_ORDER: PlayerRole[] = [
  PlayerRole.WICKET_KEEPER,
  PlayerRole.BATSMAN,
  PlayerRole.ALL_ROUNDER,
  PlayerRole.BOWLER,
];

const ROLE_LABEL: Record<string, string> = {
  [PlayerRole.WICKET_KEEPER]: 'WK',
  [PlayerRole.BATSMAN]: 'BAT',
  [PlayerRole.ALL_ROUNDER]: 'AR',
  [PlayerRole.BOWLER]: 'BOWL',
};

const buildComeTeamTitle = (handle: string, teamId: string, index: number): string => {
  const code = teamId.replace(/[^a-zA-Z0-9]/g, '').slice(-5).toUpperCase() || 'TEAM';
  return `${handle} (${code}) (T${index + 1})`;
};

const truncateShort = (label: string, max = 5): string =>
  label.length > max ? `${label.slice(0, max)}…` : label;

export const MatchHubTeamsPanel = ({
  matchId,
  teams,
  matchLocked = false,
}: MatchHubTeamsPanelProps): JSX.Element => {
  const palette = useDream11Palette();
  const navigate = useNavigate();
  const { user } = useAuth();
  const handle = resolveUserHandle(user);

  if (teams.length === 0) {
    return (
      <div className="relative min-h-[50vh] bg-white pb-28">
        <TeamsStadiumBackdrop />
        <div
          className="relative mx-2 mt-3 rounded-[10px] border px-4 py-12 text-center"
          style={{ borderColor: palette.border, backgroundColor: palette.card }}
        >
          <p className="text-[13px] font-bold" style={{ color: palette.textPrimary }}>
            No teams yet
          </p>
          <p className="mt-1 text-[11px]" style={{ color: palette.textMuted }}>
            Build your first lineup before the match locks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[55vh] bg-white pb-28 pt-2">
      <TeamsStadiumBackdrop />
      <ul className="relative flex flex-col gap-2 px-2">
        {teams.map((team, index) => (
          <li key={team.id}>
            <HubFieldTeamCard
              title={buildComeTeamTitle(handle, team.id, index)}
              team={team}
              disabled={matchLocked}
              onOpen={() =>
                navigate(
                  buildRoute(ROUTES.FANTASY_TEAM_DETAIL, { matchId, teamId: team.id }),
                )
              }
              onEdit={() =>
                navigate(
                  `${buildRoute(ROUTES.FANTASY_CREATE_TEAM, { matchId })}?editTeamId=${team.id}`,
                )
              }
              onClone={() =>
                navigate(
                  `${buildRoute(ROUTES.FANTASY_CREATE_TEAM, { matchId })}?cloneTeamId=${team.id}`,
                )
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

const TeamsStadiumBackdrop = (): JSX.Element => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(55vh,400px)] overflow-hidden"
    style={{
      background:
        'linear-gradient(180deg, rgba(255,255,255,0) 0%, #eef6fc 12%, #d4ebf9 45%, #b8ddf5 100%)',
    }}
  >
    <svg
      viewBox="0 0 400 240"
      className="absolute bottom-0 left-1/2 w-[140%] max-w-none -translate-x-1/2"
      style={{ height: 'min(48vh, 280px)' }}
      preserveAspectRatio="xMidYMax meet"
    >
      <ellipse cx="200" cy="210" rx="185" ry="24" fill="#90caf9" opacity="0.5" />
      <path d="M20 210 Q200 70 380 210" fill="none" stroke="#64b5f6" strokeWidth="2" opacity="0.45" />
      <rect x="162" y="118" width="76" height="92" rx="4" fill="#e3f2fd" stroke="#90caf9" opacity="0.65" />
      <line x1="200" y1="118" x2="200" y2="210" stroke="#90caf9" strokeWidth="1.2" opacity="0.5" />
      <line x1="48" y1="210" x2="48" y2="88" stroke="#b0bec5" strokeWidth="2.5" opacity="0.4" />
      <line x1="352" y1="210" x2="352" y2="88" stroke="#b0bec5" strokeWidth="2.5" opacity="0.4" />
      <ellipse cx="48" cy="85" rx="18" ry="8" fill="#eceff1" opacity="0.55" />
      <ellipse cx="352" cy="85" rx="18" ry="8" fill="#eceff1" opacity="0.55" />
    </svg>
  </div>
);

export const MatchHubCreateTeamFab = ({
  disabled,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}): JSX.Element => (
  <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] z-30 flex justify-center px-4">
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="pointer-events-auto inline-flex min-w-[200px] items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)] disabled:opacity-50"
      style={{ backgroundColor: '#1a2332' }}
    >
      <span className="inline-flex h-[22px] w-[22px] items-center justify-center rounded-full border border-white/45 text-[15px] font-normal leading-none">
        +
      </span>
      Create Team
    </button>
  </div>
);

const initialsOf = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
};

const HubFieldTeamCard = ({
  title,
  team,
  disabled,
  onOpen,
  onEdit,
  onClone,
}: {
  title: string;
  team: FantasyTeam;
  disabled?: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onClone: () => void;
}): JSX.Element => {
  const captain = team.players.find((p) => p.isCaptain);
  const viceCaptain = team.players.find((p) => p.isViceCaptain);

  const byTeamShort = (() => {
    const counts = new Map<string, number>();
    const labels = new Map<string, string>();
    for (const p of team.players) {
      if (!p.team) continue;
      counts.set(p.team.id, (counts.get(p.team.id) ?? 0) + 1);
      labels.set(p.team.id, p.team.shortName);
    }
    return Array.from(counts.entries()).map(([id, count]) => ({
      short: labels.get(id) ?? '—',
      count,
    }));
  })();

  const footerRoles = CRICKET_ROLE_ORDER.map((role) => ({
    role,
    label: ROLE_LABEL[role] ?? role.slice(0, 4),
    count: team.roleBreakdown[role] ?? 0,
  }));

  return (
    <article className="overflow-hidden rounded-[10px] border border-[#e0e0e0] bg-white shadow-[0_1px_6px_rgba(0,0,0,0.1)]">
      <header
        className="flex items-center justify-between gap-2 px-3 py-2"
        style={{ backgroundColor: '#2a4a26' }}
      >
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left focus:outline-none">
          <div className="truncate text-[11px] font-bold leading-tight text-white">{title}</div>
        </button>
        <div className="flex shrink-0 items-center">
          <IconButton onClick={onEdit} disabled={disabled} label="Edit">
            <Pencil className="h-[14px] w-[14px]" strokeWidth={2.25} />
          </IconButton>
          <IconButton onClick={onClone} disabled={disabled} label="Duplicate">
            <Copy className="h-[14px] w-[14px]" strokeWidth={2.25} />
          </IconButton>
          <IconButton onClick={onOpen} label="Share">
            <Share2 className="h-[14px] w-[14px]" strokeWidth={2.25} />
          </IconButton>
        </div>
      </header>

      <div className="relative overflow-hidden text-white">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #3a7d3e 0%, #449a48 45%, #4caf50 100%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 24px, transparent 24px 48px)',
          }}
        />

        <button
          type="button"
          onClick={onOpen}
          className="relative flex w-full items-center justify-between gap-3 px-3.5 py-4 focus:outline-none"
        >
          <div className="flex flex-col gap-3">
            {byTeamShort.map(({ short, count }) => (
              <div key={short} className="leading-none">
                <span className="text-[12px] font-semibold text-white/95">
                  {truncateShort(short, 5)}
                </span>
                <div className="mt-0.5 text-[24px] font-bold tabular-nums leading-none">{count}</div>
              </div>
            ))}
          </div>

          <div className="flex shrink-0 items-end gap-3 pr-0.5">
            <CaptainChip
              player={captain}
              badge="C"
              fallback={initialsOf(captain?.player?.name ?? 'C')}
            />
            <CaptainChip
              player={viceCaptain}
              badge="VC"
              fallback={initialsOf(viceCaptain?.player?.name ?? 'VC')}
            />
          </div>
        </button>

        <footer
          className="relative grid border-t border-black/20"
          style={{
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            backgroundColor: 'rgba(0,0,0,0.35)',
          }}
        >
          {footerRoles.map(({ role, label, count }, index) => (
            <div
              key={role}
              className={cn(
                'py-2 text-center text-[11px] leading-tight',
                index > 0 && 'border-l border-white/12',
              )}
            >
              <span className="font-semibold text-[#a5d6a7]">{label}</span>{' '}
              <span className="text-[13px] font-bold text-white">{count}</span>
            </div>
          ))}
        </footer>
      </div>
    </article>
  );
};

const CaptainChip = ({
  player,
  badge,
  fallback,
}: {
  player: FantasyTeam['players'][number] | undefined;
  badge: 'C' | 'VC';
  fallback: string;
}): JSX.Element => {
  const rawName = player?.player?.shortName ?? player?.player?.name ?? '—';
  const displayName =
    rawName.length > 12 ? `${rawName.slice(0, 11)}…` : rawName;

  return (
    <div className="flex w-[62px] shrink-0 flex-col items-center">
      <div className="relative h-[58px] w-[58px]">
        <div className="h-full w-full overflow-hidden rounded-full bg-[#b2dfdb] ring-[1.5px] ring-white/35">
          {player?.player?.photoUrl ? (
            <img
              src={player.player.photoUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#80cbc4] text-[14px] font-bold text-[#1b5e20]">
              {fallback}
            </div>
          )}
        </div>
        <span className="absolute -left-1 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-0.5 text-[9px] font-bold text-[#1565c0] shadow-sm">
          {badge}
        </span>
        <span className="absolute inset-x-[-2px] bottom-0 truncate rounded-sm bg-black/60 px-0.5 py-[2px] text-center text-[8px] font-semibold leading-tight text-white">
          {displayName}
        </span>
      </div>
    </div>
  );
};

const IconButton = ({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}): JSX.Element => (
  <button
    type="button"
    aria-label={label}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    disabled={disabled}
    className={cn(
      'flex h-7 w-7 items-center justify-center text-white transition-colors',
      'hover:text-white/80 focus:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-40',
    )}
  >
    {children}
  </button>
);
