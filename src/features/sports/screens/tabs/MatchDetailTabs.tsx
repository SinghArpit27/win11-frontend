import { Info, Newspaper, Trophy, Users } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { cn } from '@utils/cn';

import { ContestCard } from '@features/contests/components/ContestCard';
import { useListContestsQuery } from '@features/contests/contest.api';
import type { ContestSummary } from '@features/contests/contest.types';

import { useGetMatchPlayersQuery, useGetMatchUpdatesQuery } from '../../sports.api';
import { formatAbsoluteDate, isMatchLive } from '../../sports.utils';
import type { SportsMatchDetail } from '../../sports.types';

export type MatchDetailTabId = 'info' | 'players' | 'contests' | 'updates';

interface MatchDetailTabsProps {
  match: SportsMatchDetail;
  activeTab: MatchDetailTabId;
  onChange: (tab: MatchDetailTabId) => void;
}

/**
 * Match detail tabs foundation.
 *
 *  Phase 4 wires the surface + the data feeds we already have:
 *    - Info     : reads from the loaded match detail (no extra fetch).
 *    - Players  : pulls /sports/matches/:id/players (placeholder rows).
 *    - Contests : pure placeholder until Phase 6.
 *    - Updates  : live event feed (mounts the live-updates query).
 *
 *  Why keep tabs in a sub-component?
 *  → Lets us code-split future tab implementations (player picker, head
 *    -to-head charts, etc.) without inflating the parent screen.
 */
export const MatchDetailTabs = ({
  match,
  activeTab,
  onChange,
}: MatchDetailTabsProps): JSX.Element => {
  const tabs = useMemo<ReadonlyArray<{ id: MatchDetailTabId; label: string; Icon: typeof Info }>>(
    () => [
      { id: 'info', label: 'Info', Icon: Info },
      { id: 'players', label: 'Players', Icon: Users },
      { id: 'contests', label: 'Contests', Icon: Trophy },
      { id: 'updates', label: 'Updates', Icon: Newspaper },
    ],
    [],
  );

  return (
    <section className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Match details"
        className="sticky top-0 z-10 flex w-full items-center gap-1 overflow-x-auto rounded-xl bg-surface p-1 shadow-sm backdrop-blur lg:static"
      >
        {tabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(id)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-text-muted hover:text-text',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === 'info' ? <InfoTab match={match} /> : null}
      {activeTab === 'players' ? <PlayersTab matchId={match.id} /> : null}
      {activeTab === 'contests' ? <ContestsTab matchId={match.id} /> : null}
      {activeTab === 'updates' ? <UpdatesTab match={match} /> : null}
    </section>
  );
};

// ─── Info tab ──────────────────────────────────────────────────────────────

const InfoTab = ({ match }: { match: SportsMatchDetail }): JSX.Element => (
  <Card padding="lg" className="space-y-3">
    <InfoRow label="Sport" value={match.sport} />
    <InfoRow label="Format" value={match.format} />
    <InfoRow label="Tournament" value={`${match.tournament.name}`} />
    {match.venue.name ? (
      <InfoRow
        label="Venue"
        value={`${match.venue.name}${match.venue.city ? `, ${match.venue.city}` : ''}${
          match.venue.country ? `, ${match.venue.country}` : ''
        }`}
      />
    ) : null}
    <InfoRow label="Scheduled" value={formatAbsoluteDate(match.scheduledAt)} />
    {match.startedAt ? (
      <InfoRow label="Started" value={formatAbsoluteDate(match.startedAt)} />
    ) : null}
    {match.completedAt ? (
      <InfoRow label="Completed" value={formatAbsoluteDate(match.completedAt)} />
    ) : null}
    {match.tossWinnerTeamId ? (
      <InfoRow
        label="Toss"
        value={`${
          match.tossWinnerTeamId === match.homeTeam.id ? match.homeTeam.shortName : match.awayTeam.shortName
        }${match.tossDecision ? ` chose to ${match.tossDecision.toLowerCase()}` : ''}`}
      />
    ) : null}
    {match.viewCount ? (
      <InfoRow label="Followers" value={match.viewCount.toLocaleString()} />
    ) : null}
  </Card>
);

const InfoRow = ({ label, value }: { label: string; value: string }): JSX.Element => (
  <div className="grid grid-cols-3 items-baseline gap-3 border-b border-border last:border-0 last:pb-0">
    <Typography variant="caption" tone="muted" className="col-span-1">
      {label}
    </Typography>
    <Typography variant="body" className="col-span-2 break-words font-medium">
      {value}
    </Typography>
  </div>
);

// ─── Players tab (Phase 4 preview) ────────────────────────────────────────

const PlayersTab = ({ matchId }: { matchId: string }): JSX.Element => {
  const query = useGetMatchPlayersQuery({ matchId });

  if (query.isLoading) {
    return (
      <Card padding="lg" className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Card>
    );
  }

  if (!query.data || query.data.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <Typography variant="h4" className="block">
          Lineups will appear here
        </Typography>
        <Typography variant="caption" tone="muted" className="mt-1 block">
          Player previews + fantasy points unlock once lineups are confirmed (about an hour before
          the match).
        </Typography>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="space-y-2">
      {query.data.map((row) => (
        <div key={row.id} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'inline-block h-2 w-2 rounded-full',
                row.isInLineup ? 'bg-success' : 'bg-text-muted',
              )}
              aria-hidden
            />
            <Typography variant="body" className="font-medium">
              {row.playerId}
            </Typography>
          </div>
          <Typography variant="caption" tone="muted" className="tabular-nums">
            {row.fantasyPoints.toFixed(1)} pts
          </Typography>
        </div>
      ))}
    </Card>
  );
};

// ─── Contests tab (Phase 6) ──────────────────────────────────────────────

const CONTESTS_TAB_LIMIT = 6;

const ContestsTab = ({ matchId }: { matchId: string }): JSX.Element => {
  const navigate = useNavigate();
  const query = useListContestsQuery({
    matchId,
    page: 1,
    limit: CONTESTS_TAB_LIMIT,
    hideFull: false,
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const items = (query.data?.items ?? []) as ContestSummary[];
  if (items.length === 0) {
    return (
      <Card padding="xl" className="border-dashed text-center">
        <Trophy className="mx-auto h-8 w-8 text-text-muted" />
        <Typography variant="h3" className="mt-3 block">
          No contests yet
        </Typography>
        <Typography variant="caption" tone="muted" className="mt-1 block">
          Contests open closer to match time. Check back soon.
        </Typography>
      </Card>
    );
  }

  const goToList = (): void =>
    navigate(ROUTES.MATCH_CONTESTS.replace(':matchId', matchId));
  const goToDetail = (id: string): void =>
    navigate(
      ROUTES.CONTEST_DETAIL.replace(':matchId', matchId).replace(':contestId', id),
    );
  const goToJoin = (id: string): void =>
    navigate(
      ROUTES.CONTEST_JOIN.replace(':matchId', matchId).replace(':contestId', id),
    );

  return (
    <div className="flex flex-col gap-3">
      {items.map((contest) => (
        <ContestCard
          key={contest.id}
          contest={contest}
          onClick={(c) => goToDetail(c.id)}
          onJoinClick={(c) => goToJoin(c.id)}
        />
      ))}
      <button
        type="button"
        onClick={goToList}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-hover"
      >
        View all contests →
      </button>
    </div>
  );
};

// ─── Live updates tab ─────────────────────────────────────────────────────

const UpdatesTab = ({ match }: { match: SportsMatchDetail }): JSX.Element => {
  const isLive = isMatchLive(match);
  const query = useGetMatchUpdatesQuery(
    { matchId: match.id, limit: 30 },
    { pollingInterval: isLive ? 10_000 : 0 },
  );

  if (query.isLoading) {
    return (
      <Card padding="lg" className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </Card>
    );
  }

  if (!query.data || query.data.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <Typography variant="h4" className="block">
          No updates yet
        </Typography>
        <Typography variant="caption" tone="muted" className="mt-1 block">
          We'll stream events as soon as the match starts.
        </Typography>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="space-y-3">
      {query.data.map((u) => (
        <div key={u.id} className="flex items-start gap-3 border-b border-border pb-3 last:border-0">
          <div className="mt-0.5 rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {u.type}
          </div>
          <div className="min-w-0 flex-1">
            <Typography variant="body" className="block break-words font-medium">
              {summariseUpdate(u.payload)}
            </Typography>
            <Typography variant="caption" tone="muted" className="block">
              {formatAbsoluteDate(u.occurredAt)}
            </Typography>
          </div>
        </div>
      ))}
    </Card>
  );
};

const summariseUpdate = (payload: Record<string, unknown>): string => {
  // Best-effort summariser — the wire format is provider-specific so we
  // fall back to JSON for unknown shapes. Concrete narratives ship with
  // the production cricket / football transformers in Phase 5+.
  if (!payload || typeof payload !== 'object') return '—';
  const text = (payload.text ?? payload.summary ?? payload.message) as string | undefined;
  if (typeof text === 'string') return text;
  return JSON.stringify(payload).slice(0, 200);
};
