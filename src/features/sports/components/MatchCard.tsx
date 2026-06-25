import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { cn } from '@utils/cn';

import {
  formatMatchClock,
  formatMatchDayHint,
  formatMatchTime,
  formatScore,
  formatTournamentTag,
  isMatchLive,
  matchStatusLabel,
} from '../sports.utils';
import type { SportsMatchSummary } from '../sports.types';
import { LiveBadge } from './LiveBadge';
import { MegaContestBadge } from './MegaContestBadge';
import { TeamBadge } from './TeamBadge';

/**
 * Match card — Dream11 / My11Circle inspired layout.
 *
 *  Visual structure (default variant):
 *
 *  ┌──────────────────────────────────────────────────────────────┐
 *  │ 🏏 T20 · NZ-W in ENG, 3 T20Is, 2026          🔖 / Lineups Out│
 *  │                                                              │
 *  │ 🇬🇧 ENG-W  England Women               │  8m : 10s            │
 *  │ 🇳🇿 NZ-W   New Zealand Women           │  7:00 PM             │
 *  │ ─────────────────────────────────────────────────────────────│
 *  │ ⬡ ₹57.03 Lakhs+                                              │
 *  └──────────────────────────────────────────────────────────────┘
 *
 *  Adaptive behaviour:
 *   - LIVE      → right column shows live score + LIVE pill
 *   - UPCOMING  → countdown (red < 1h) / day-of-week / absolute date
 *   - COMPLETED → result summary in muted strip
 *
 *  Interactions:
 *   - hover-lift + ring on desktop,
 *   - tap-feedback / active state on touch,
 *   - keyboard accessible (button semantics + focus-visible ring).
 *
 *  Theme:
 *   - Every colour resolves from theme tokens. The optional team
 *     `primaryColor` paints a faint top-of-card stripe so cards still
 *     feel branded without inlining brand hex codes elsewhere.
 *
 *  Compact variant: row layout for trending / "more matches" lists.
 */
interface MatchCardProps {
  match: SportsMatchSummary;
  variant?: 'default' | 'compact';
  onClick?: () => void;
  className?: string;
}

export const MatchCard = ({
  match,
  variant = 'default',
  onClick,
  className,
}: MatchCardProps): JSX.Element => {
  const navigate = useNavigate();
  const live = isMatchLive(match);

  const handleClick = (): void => {
    if (onClick) onClick();
    else navigate(ROUTES.MATCH_DETAIL.replace(':matchId', match.id));
  };

  if (variant === 'compact') {
    return (
      <CompactCard match={match} live={live} onClick={handleClick} className={className} />
    );
  }
  return <DefaultCard match={match} live={live} onClick={handleClick} className={className} />;
};

// ─── Default variant ───────────────────────────────────────────────────────

const DefaultCard = ({
  match,
  live,
  onClick,
  className,
}: {
  match: SportsMatchSummary;
  live: boolean;
  onClick: () => void;
  className?: string;
}): JSX.Element => {
  const completed = !!match.completedAt;
  const lineupsOut = !!match.lineupLockedAt && new Date(match.lineupLockedAt).getTime() <= Date.now();
  const accentColor = match.homeTeam.primaryColor ?? match.tournament.accentColor ?? null;

  return (
    <Card
      padding="none"
      variant="flat"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'group relative cursor-pointer overflow-hidden border border-border bg-surface transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md hover:border-border-strong',
        'active:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
    >
      {/* Team-coloured accent strip — invisible if no brand colour is known. */}
      {accentColor ? (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ backgroundColor: accentColor }}
        />
      ) : null}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
        <div className="flex min-w-0 items-center gap-2 text-xs">
          <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            {match.format}
          </span>
          <Typography variant="caption" tone="muted" className="truncate font-medium">
            {formatTournamentTag(match)}
          </Typography>
        </div>
        <div className="shrink-0">
          {live ? (
            <LiveBadge />
          ) : lineupsOut ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success">
              Lineups Out
            </span>
          ) : (
            <Bookmark
              className="h-4 w-4 text-text-muted transition-colors group-hover:text-text"
              aria-hidden
            />
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3 sm:gap-4">
        <div className="flex min-w-0 flex-col gap-2.5">
          <TeamRow
            shortName={match.homeTeam.shortName}
            name={match.homeTeam.name}
            logoUrl={match.homeTeam.logoUrl}
            primaryColor={match.homeTeam.primaryColor}
            scoreText={live || completed ? formatScore(match, 'home') : null}
          />
          <TeamRow
            shortName={match.awayTeam.shortName}
            name={match.awayTeam.name}
            logoUrl={match.awayTeam.logoUrl}
            primaryColor={match.awayTeam.primaryColor}
            scoreText={live || completed ? formatScore(match, 'away') : null}
          />
        </div>

        <div className="h-12 w-px shrink-0 bg-border" aria-hidden />

        <RightColumn match={match} live={live} />
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-bg-elevated/40 px-4 py-2.5">
        {completed ? (
          <Typography variant="caption" className="font-semibold text-success">
            {match.resultSummary ?? 'Match completed'}
          </Typography>
        ) : (
          <MegaContestBadge />
        )}
      </div>
    </Card>
  );
};

// ─── Pieces ────────────────────────────────────────────────────────────────

const TeamRow = ({
  shortName,
  name,
  logoUrl,
  primaryColor,
  scoreText,
}: {
  shortName: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  scoreText: string | null;
}): JSX.Element => (
  <div className="flex min-w-0 items-center gap-2.5">
    <TeamBadge
      shortName={shortName}
      name={name}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      size="md"
    />
    <div className="flex min-w-0 flex-1 items-baseline gap-2">
      <Typography
        variant="body"
        className="shrink-0 text-sm font-bold tracking-tight sm:text-[15px]"
      >
        {shortName}
      </Typography>
      <Typography
        variant="caption"
        tone="muted"
        className="min-w-0 truncate text-[12px]"
      >
        {name}
      </Typography>
    </div>
    {scoreText ? (
      <Typography variant="caption" className="shrink-0 font-semibold tabular-nums text-text">
        {scoreText}
      </Typography>
    ) : null}
  </div>
);

const RightColumn = ({
  match,
  live,
}: {
  match: SportsMatchSummary;
  live: boolean;
}): JSX.Element => {
  if (live) {
    return (
      <div className="flex min-w-[60px] flex-col items-end gap-1 text-right">
        <Typography variant="caption" className="font-bold text-danger">
          {match.resultSummary ?? 'In progress'}
        </Typography>
        <Typography variant="caption" tone="muted" className="block">
          {formatMatchClock(match.scheduledAt)}
        </Typography>
      </div>
    );
  }

  if (match.completedAt) {
    return (
      <div className="flex min-w-[60px] flex-col items-end gap-0.5 text-right">
        <Typography variant="caption" className="font-bold text-text">
          {matchStatusLabel(match.status)}
        </Typography>
        <Typography variant="caption" tone="muted" className="block">
          {formatMatchTime(match.completedAt)}
        </Typography>
      </div>
    );
  }

  const hint = formatMatchDayHint(match.scheduledAt);
  const isUrgent = hint?.tone === 'urgent';
  return (
    <div className="flex min-w-[64px] flex-col items-end gap-0.5 text-right">
      <Typography
        variant="caption"
        className={cn(
          'font-bold tabular-nums',
          isUrgent ? 'text-danger' : 'text-text',
        )}
      >
        {hint?.primary ?? formatMatchTime(match.scheduledAt)}
      </Typography>
      <Typography variant="caption" tone="muted" className="block tabular-nums">
        {formatMatchClock(match.scheduledAt)}
      </Typography>
    </div>
  );
};

// ─── Compact variant ───────────────────────────────────────────────────────

const CompactCard = ({
  match,
  live,
  onClick,
  className,
}: {
  match: SportsMatchSummary;
  live: boolean;
  onClick: () => void;
  className?: string;
}): JSX.Element => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'group flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3 text-left transition-colors',
      'hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
      className,
    )}
  >
    <div className="flex shrink-0 items-center -space-x-3">
      <TeamBadge
        shortName={match.homeTeam.shortName}
        name={match.homeTeam.name}
        logoUrl={match.homeTeam.logoUrl}
        primaryColor={match.homeTeam.primaryColor}
        size="sm"
      />
      <TeamBadge
        shortName={match.awayTeam.shortName}
        name={match.awayTeam.name}
        logoUrl={match.awayTeam.logoUrl}
        primaryColor={match.awayTeam.primaryColor}
        size="sm"
      />
    </div>
    <div className="min-w-0 flex-1">
      <Typography variant="body" className="block truncate text-sm font-semibold">
        {match.homeTeam.shortName} vs {match.awayTeam.shortName}
      </Typography>
      <Typography variant="caption" tone="muted" className="block truncate">
        {formatTournamentTag(match)} · {formatMatchTime(match.scheduledAt)}
      </Typography>
    </div>
    {live ? (
      <LiveBadge />
    ) : (
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        {matchStatusLabel(match.status)}
      </span>
    )}
  </button>
);
