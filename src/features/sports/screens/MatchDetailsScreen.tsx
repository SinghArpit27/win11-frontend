import { ArrowLeft, Calendar, MapPin, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageContainer } from '@components/layout';
import { Button, Card, Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';

import {
  LiveBadge,
  MatchCountdown,
  TeamBadge,
} from '../components';
import { useGetMatchDetailQuery } from '../sports.api';
import {
  formatAbsoluteDate,
  formatMatchTime,
  formatScore,
  isMatchLive,
  matchStatusLabel,
} from '../sports.utils';
import { MatchDetailTabs, type MatchDetailTabId } from './tabs/MatchDetailTabs';

/**
 * Match details screen.
 *
 *  Layout:
 *   - Mobile: full-bleed hero with teams + status, sticky tabs below.
 *   - Desktop: hero + meta side-by-side, tabs inline.
 *
 *  Polling:
 *   - When the match is LIVE we poll every 15 s to keep score/status
 *     fresh without spamming the backend cache.
 *
 *  Tabs (Phase 4 foundations only — contests/lineup hydrate in Phase 5+):
 *   - Info      → tournament, venue, schedule, head-to-head metadata
 *   - Players   → preview placeholder
 *   - Contests  → placeholder until Phase 6
 *   - Updates   → live event feed (LIVE matches only)
 */
const MatchDetailsScreen = (): JSX.Element => {
  const { matchId = '' } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<MatchDetailTabId>('info');

  const matchQuery = useGetMatchDetailQuery(
    { matchId },
    {
      pollingInterval: 15_000,
      skip: !matchId,
      // Only poll while the cached match is LIVE; otherwise the polling
      // is wasted bandwidth — RTK Query lets us flip this dynamically.
      refetchOnMountOrArgChange: true,
    },
  );

  const match = matchQuery.data;
  const live = useMemo(() => (match ? isMatchLive(match) : false), [match]);

  if (matchQuery.isLoading) {
    return (
      <PageContainer as="div" className="gap-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </PageContainer>
    );
  }

  if (matchQuery.isError || !match) {
    return (
      <PageContainer as="div" className="gap-4">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate(ROUTES.MATCHES)}
        >
          Back to matches
        </Button>
        <Card padding="xl" className="text-center">
          <Typography variant="h3" className="block">
            Match not found
          </Typography>
          <Typography variant="caption" tone="muted" className="mt-1 block">
            The match you're looking for may have been removed or never existed.
          </Typography>
        </Card>
      </PageContainer>
    );
  }

  const gradient =
    match.homeTeam.primaryColor && match.awayTeam.primaryColor
      ? `linear-gradient(135deg, ${match.homeTeam.primaryColor}40 0%, transparent 50%, ${match.awayTeam.primaryColor}40 100%)`
      : undefined;

  return (
    <PageContainer as="div" className="gap-5 lg:gap-6">
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => navigate(-1)}
        className="self-start"
      >
        Back
      </Button>

      {/* Hero header */}
      <Card padding="lg" className="relative overflow-hidden">
        {gradient ? (
          <div aria-hidden style={{ backgroundImage: gradient }} className="absolute inset-0" />
        ) : null}

        <div className="relative flex flex-col gap-4">
          {/* Tournament + status row */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex min-w-0 items-center gap-1.5 text-text-muted">
              <Trophy className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate font-semibold">
                {match.tournament.name}
                {match.tournament.shortName !== match.tournament.name
                  ? ` (${match.tournament.shortName})`
                  : ''}
              </span>
            </div>
            {live ? (
              <LiveBadge />
            ) : (
              <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                {matchStatusLabel(match.status)}
              </span>
            )}
          </div>

          {/* Teams grid */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
            <TeamPanel
              shortName={match.homeTeam.shortName}
              name={match.homeTeam.name}
              logoUrl={match.homeTeam.logoUrl}
              primaryColor={match.homeTeam.primaryColor}
              scoreText={live || match.completedAt ? formatScore(match, 'home') : null}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <Typography
                variant="caption"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted"
              >
                vs
              </Typography>
              {!match.completedAt && !live ? (
                <MatchCountdown scheduledAt={match.scheduledAt} className="text-sm" />
              ) : null}
            </div>
            <TeamPanel
              shortName={match.awayTeam.shortName}
              name={match.awayTeam.name}
              logoUrl={match.awayTeam.logoUrl}
              primaryColor={match.awayTeam.primaryColor}
              scoreText={live || match.completedAt ? formatScore(match, 'away') : null}
              align="end"
            />
          </div>

          {/* Result / time */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-medium text-text">
                {formatMatchTime(match.scheduledAt)}
                <span className="ml-1 text-text-muted">
                  · {formatAbsoluteDate(match.scheduledAt)}
                </span>
              </span>
            </div>
            {match.venue.name ? (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">
                  {match.venue.name}
                  {match.venue.city ? `, ${match.venue.city}` : ''}
                </span>
              </div>
            ) : null}
          </div>

          {/* Result / status banner */}
          {live ? (
            <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-semibold text-danger">
              {match.resultSummary ?? 'Live now — score updating in real-time.'}
            </div>
          ) : match.resultSummary ? (
            <div className="rounded-lg bg-success/10 px-3 py-2 text-sm font-semibold text-success">
              {match.resultSummary}
            </div>
          ) : null}
        </div>
      </Card>

      {/* Fantasy team CTA — entry point for the Phase 5 flow. */}
      <Card padding="md" variant="flat" className="border-dashed">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Typography variant="h4" className="block">
              Build your fantasy team
            </Typography>
            <Typography variant="caption" tone="muted" className="block">
              {match.status === 'UPCOMING' || match.status === 'LIVE'
                ? 'Pick 11 players, choose your captain & vice-captain, and manage multiple teams.'
                : 'Match has ended — view your saved teams and their final points.'}
            </Typography>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                navigate(ROUTES.FANTASY_MY_TEAMS.replace(':matchId', match.id))
              }
            >
              My teams
            </Button>
            <Button
              variant="gradient"
              size="md"
              onClick={() =>
                navigate(ROUTES.FANTASY_CREATE_TEAM.replace(':matchId', match.id))
              }
              disabled={Boolean(match.completedAt)}
            >
              Create team
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs foundation */}
      <MatchDetailTabs match={match} activeTab={tab} onChange={setTab} />
    </PageContainer>
  );
};

const TeamPanel = ({
  shortName,
  name,
  logoUrl,
  primaryColor,
  scoreText,
  align = 'start',
}: {
  shortName: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  scoreText: string | null;
  align?: 'start' | 'end';
}): JSX.Element => (
  <div
    className={
      'flex min-w-0 flex-col items-center gap-2 text-center sm:gap-3 ' +
      (align === 'end' ? 'sm:items-end sm:text-right' : 'sm:items-start sm:text-left')
    }
  >
    <TeamBadge
      shortName={shortName}
      name={name}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      size="xl"
    />
    <div className="min-w-0">
      <Typography variant="h3" className="block truncate text-lg font-bold sm:text-xl">
        {shortName}
      </Typography>
      <Typography variant="caption" tone="muted" className="block truncate">
        {name}
      </Typography>
    </div>
    {scoreText ? (
      <Typography variant="h4" className="block tabular-nums">
        {scoreText}
      </Typography>
    ) : null}
  </div>
);

export default MatchDetailsScreen;
