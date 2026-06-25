import { Copy, Pencil, Plus, Share2, Trophy } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Skeleton,
  Typography,
} from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { cn } from '@utils/cn';

import { FantasyMatchHeader, FantasyPillActionBar } from '../components';
import {
  useCloneFantasyTeamMutation,
  useDeleteFantasyTeamMutation,
  useGetFantasyMatchContextQuery,
  useListMyFantasyTeamsQuery,
} from '../fantasy.api';
import type { FantasyTeam } from '../fantasy.types';

/**
 * Fantasy "My teams" list per match.
 *
 *  Visual reference (Dream11):
 *   - Dark match header (no progress dots — compact mode).
 *   - Each team renders inside a green-field card showing:
 *      - Team name + edit / clone / share icons,
 *      - Team distribution (5 vs 6) under the title,
 *      - Captain + vice-captain photos side-by-side with badges,
 *      - Role breakdown chips (WK 1 / BAT 6 / AR 2 / BOWL 2).
 *   - Sticky bottom pill bar with a `+ CREATE TEAM` CTA.
 *
 *  Layout:
 *   - Mobile  → single column of full-width team cards.
 *   - Desktop → 2-col grid for denser scanning.
 */
const MyTeamsScreen = (): JSX.Element => {
  const { matchId = '' } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const ctxQuery = useGetFantasyMatchContextQuery({ matchId }, { skip: !matchId });
  const teamsQuery = useListMyFantasyTeamsQuery(
    { matchId, page: 1, limit: 50 },
    { skip: !matchId },
  );

  const [cloneTeam, cloneState] = useCloneFantasyTeamMutation();
  const [deleteTeam, deleteState] = useDeleteFantasyTeamMutation();
  const [confirmDelete, setConfirmDelete] = useState<FantasyTeam | null>(null);

  if (ctxQuery.isLoading || teamsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3 p-3">
        <Skeleton className="h-24 w-full rounded-none" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const ctx = ctxQuery.data;
  const rule = ctx?.rule ?? null;
  const teams = teamsQuery.data?.items ?? [];

  if (!ctx || !rule) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <Typography variant="h3">Fantasy not available</Typography>
        <Typography variant="caption" tone="muted">
          This match isn't configured for fantasy yet.
        </Typography>
        <Button
          variant="primary"
          onClick={() => navigate(ROUTES.MATCH_DETAIL.replace(':matchId', matchId))}
        >
          Back to match
        </Button>
      </div>
    );
  }

  const reachedMax = teams.length >= rule.maxTeamsPerUserPerMatch;
  const matchLocked = ctx.isLocked;

  const onClone = async (team: FantasyTeam): Promise<void> => {
    try {
      const newTeam = await cloneTeam({ teamId: team.id, matchId }).unwrap();
      navigate(
        ROUTES.FANTASY_TEAM_DETAIL.replace(':matchId', matchId).replace(':teamId', newTeam.id),
      );
    } catch {
      /* swallow */
    }
  };

  const onDelete = async (): Promise<void> => {
    if (!confirmDelete) return;
    try {
      await deleteTeam({ teamId: confirmDelete.id, matchId }).unwrap();
      setConfirmDelete(null);
    } catch {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg pb-32">
      <FantasyMatchHeader
        context={ctx}
        title={
          ctx.match
            ? `${ctx.match.homeTeam.shortName} v ${ctx.match.awayTeam.shortName}`
            : 'My teams'
        }
        onBack={() => navigate(ROUTES.MATCH_DETAIL.replace(':matchId', matchId))}
        compact
      />

      {/* Tab strip with Teams (n) active */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border bg-surface px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SectionTab label="Contests" />
        <SectionTab label="My Contests" />
        <SectionTab label={`Teams (${teams.length})`} active />
        <SectionTab label="Stats" />
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <Trophy className="h-8 w-8 text-text-muted" />
          <Typography variant="h4">No teams yet</Typography>
          <Typography variant="caption" tone="muted">
            Build your first lineup before the match locks.
          </Typography>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 p-3 sm:p-4 lg:grid lg:grid-cols-2 lg:gap-4">
          {teams.map((team) => (
            <li key={team.id}>
              <FieldTeamCard
                team={team}
                disabled={matchLocked}
                cloning={cloneState.isLoading}
                onOpen={() =>
                  navigate(
                    ROUTES.FANTASY_TEAM_DETAIL.replace(':matchId', matchId).replace(
                      ':teamId',
                      team.id,
                    ),
                  )
                }
                onEdit={() =>
                  navigate(
                    `${ROUTES.FANTASY_CREATE_TEAM.replace(':matchId', matchId)}?editTeamId=${team.id}`,
                  )
                }
                onClone={() => onClone(team)}
              />
            </li>
          ))}
        </ul>
      )}

      <FantasyPillActionBar
        actions={[
          {
            id: 'create',
            label: 'Create Team',
            icon: Plus,
            primary: true,
            disabled: reachedMax || matchLocked,
            onClick: () => navigate(ROUTES.FANTASY_CREATE_TEAM.replace(':matchId', matchId)),
          },
        ]}
      />

      <Modal open={Boolean(confirmDelete)} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete team?</ModalTitle>
            <ModalDescription>
              {confirmDelete
                ? `"${confirmDelete.name}" will be permanently removed.`
                : 'This action cannot be undone.'}
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDelete} loading={deleteState.isLoading}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

// ── Tab strip ──────────────────────────────────────────────────────────
const SectionTab = ({ label, active }: { label: string; active?: boolean }): JSX.Element => (
  <button
    type="button"
    className={cn(
      'shrink-0 px-3 py-2.5 text-[12px] font-bold uppercase tracking-wider transition-colors',
      active ? 'text-primary' : 'text-text-muted hover:text-text',
    )}
  >
    {label}
    {active ? <span className="absolute h-0.5" /> : null}
  </button>
);

// ── Internal — team card ───────────────────────────────────────────────
interface FieldTeamCardProps {
  team: FantasyTeam;
  disabled?: boolean;
  cloning?: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onClone: () => void;
}

const initialsOf = (name: string): string => {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
};

const FieldTeamCard = ({
  team,
  disabled,
  cloning,
  onOpen,
  onEdit,
  onClone,
}: FieldTeamCardProps): JSX.Element => {
  const captain = team.players.find((p) => p.playerId === team.captainPlayerId);
  const viceCaptain = team.players.find((p) => p.playerId === team.viceCaptainPlayerId);

  // Group player counts by real-world team for the "5 - 6" split.
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

  const roleEntries = Object.entries(team.roleBreakdown);

  return (
    <article className="relative overflow-hidden rounded-2xl bg-gradient-field text-white shadow-md">
      {/* Decorative pitch overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 28px, transparent 28px 56px)',
        }}
      />

      <header className="relative flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5">
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left focus:outline-none"
        >
          <div className="truncate text-sm font-bold leading-tight text-white">{team.name}</div>
          {byTeamShort.length === 2 ? (
            <div className="mt-0.5 text-[11px] text-white/70">
              <span className="font-semibold text-white">{byTeamShort[0]!.short}</span>
              <span className="mx-1 opacity-50">·</span>
              <span className="font-bold text-white">{byTeamShort[0]!.count}</span>
              <span className="mx-1 opacity-50">/</span>
              <span className="font-semibold text-white">{byTeamShort[1]!.short}</span>
              <span className="mx-1 opacity-50">·</span>
              <span className="font-bold text-white">{byTeamShort[1]!.count}</span>
            </div>
          ) : null}
        </button>
        <div className="flex items-center gap-1">
          <IconButton onClick={onEdit} disabled={disabled} label="Edit">
            <Pencil className="h-4 w-4" />
          </IconButton>
          <IconButton onClick={onClone} disabled={disabled || cloning} label="Clone">
            <Copy className="h-4 w-4" />
          </IconButton>
          <IconButton onClick={onOpen} label="Share">
            <Share2 className="h-4 w-4" />
          </IconButton>
        </div>
      </header>

      <button
        type="button"
        onClick={onOpen}
        className="relative flex w-full items-center justify-center gap-6 py-5 focus:outline-none"
      >
        <CaptainBadge
          player={captain}
          badge="C"
          fallback={`${initialsOf(captain?.player?.name ?? 'C ')}`}
        />
        <CaptainBadge
          player={viceCaptain}
          badge="VC"
          fallback={`${initialsOf(viceCaptain?.player?.name ?? 'VC')}`}
        />
      </button>

      <footer className="relative grid grid-cols-4 divide-x divide-white/10 border-t border-white/10 bg-black/25 text-center text-[10px] uppercase tracking-wider">
        {roleEntries.length > 0 ? (
          roleEntries.slice(0, 4).map(([role, count]) => (
            <div key={role} className="flex flex-col py-2">
              <span className="font-bold text-white/70">{role.slice(0, 4)}</span>
              <span className="text-base font-bold text-white">{count}</span>
            </div>
          ))
        ) : (
          <div className="col-span-4 py-2 text-white/60">No role data yet</div>
        )}
      </footer>
    </article>
  );
};

const CaptainBadge = ({
  player,
  badge,
  fallback,
}: {
  player: FantasyTeam['players'][number] | undefined;
  badge: 'C' | 'VC';
  fallback: string;
}): JSX.Element => (
  <div className="flex flex-col items-center">
    <div className="relative">
      <div
        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-surface-elevated text-xs font-bold text-white ring-2 ring-white/30"
        style={
          player?.team?.primaryColor
            ? { backgroundColor: `${player.team.primaryColor}cc` }
            : undefined
        }
      >
        {player?.player?.photoUrl ? (
          <img
            src={player.player.photoUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{fallback}</span>
        )}
      </div>
      <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-text px-1 text-[9px] font-bold text-bg shadow ring-2 ring-white/40">
        {badge}
      </span>
    </div>
    <div className="mt-1 max-w-[88px] truncate text-center text-[11px] font-semibold text-white">
      {player?.player?.shortName ?? player?.player?.name ?? '—'}
    </div>
  </div>
);

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
      'flex h-8 w-8 items-center justify-center rounded-full text-white/85 transition-colors',
      'hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
      'disabled:cursor-not-allowed disabled:opacity-40',
    )}
  >
    {children}
  </button>
);

export default MyTeamsScreen;
