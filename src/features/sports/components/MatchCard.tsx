import { Bell, BellPlus, ChevronRight, Shirt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { useCountdown } from '@hooks/useCountdown';
import { cn } from '@utils/cn';
import { buildRoute } from '@utils/routes.util';

import {
  formatMatchClock,
  formatMatchDayHint,
  formatScore,
  formatTournamentTag,
  isMatchLive,
  matchStatusLabel,
  pad2,
  SPORT_ICON_HINT,
  type MatchTimeStyle,
} from '../sports.utils';
import type { SportsMatchSummary } from '../sports.types';
import type { Dream11Palette } from '../dream11.tokens';
import { useDream11Palette } from '../hooks/useDream11Palette';
import { LiveBadge } from './LiveBadge';
import { CricketBatBallIcon, JerseyPlusIcon } from './Dream11Icons';
import { MegaContestBadge } from './MegaContestBadge';
import { TeamBadge } from './TeamBadge';

interface MatchCardProps {
  match: SportsMatchSummary;
  variant?: 'default' | 'compact';
  /** Dream11 light card for home / mobile match feeds. */
  appearance?: 'dream11' | 'default';
  prizeLabel?: string | null;
  timeStyle?: MatchTimeStyle;
  onClick?: () => void;
  className?: string;
}

export const MatchCard = ({
  match,
  variant = 'default',
  appearance = 'dream11',
  prizeLabel,
  timeStyle = 'countdown',
  onClick,
  className,
}: MatchCardProps): JSX.Element => {
  const navigate = useNavigate();
  const live = isMatchLive(match);

  const handleClick = (): void => {
    if (onClick) onClick();
    else navigate(buildRoute(ROUTES.MATCH_CONTESTS, { matchId: match.id }));
  };

  if (appearance === 'dream11') {
    return (
      <Dream11Card
        match={match}
        live={live}
        prizeLabel={prizeLabel}
        timeStyle={timeStyle}
        onClick={handleClick}
        className={className}
      />
    );
  }

  if (variant === 'compact') {
    return (
      <CompactCard match={match} live={live} onClick={handleClick} className={className} />
    );
  }

  return (
    <DefaultCard
      match={match}
      live={live}
      prizeLabel={prizeLabel}
      timeStyle={timeStyle}
      onClick={handleClick}
      className={className}
    />
  );
};

/** Dream11 reference — nested grey panel, compact spacing, bat/ball icon. */
const Dream11Card = ({
  match,
  live,
  prizeLabel,
  timeStyle,
  onClick,
  className,
}: {
  match: SportsMatchSummary;
  live: boolean;
  prizeLabel?: string | null;
  timeStyle: MatchTimeStyle;
  onClick: () => void;
  className?: string;
}): JSX.Element => {
  const palette = useDream11Palette();
  const completed = !!match.completedAt;
  const showScores = live || completed;
  const seriesTag = formatTournamentTag(match);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'cursor-pointer overflow-hidden rounded-[10px] border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d82d2c]/40',
        className,
      )}
      style={{
        borderColor: palette.border,
        backgroundColor: palette.card,
        colorScheme: palette.card === '#ffffff' ? 'light' : 'dark',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-1.5 px-2.5 pb-1 pt-2">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          <CricketBatBallIcon palette={palette} />
          <p
            className="min-w-0 truncate text-[11px] font-normal leading-[14px]"
            style={{ color: palette.textTertiary }}
          >
            {`${match.format} · ${seriesTag}`}
          </p>
          <ChevronRight
            className="h-2.5 w-2.5 shrink-0"
            style={{ color: palette.chevron }}
            aria-hidden
          />
        </div>
        <JerseyPlusIcon palette={palette} />
      </div>

      {/* Nested panel — inset with side gaps + rounded corners */}
      <div className="px-2 pb-2">
        <div
          className="rounded-[8px] px-2 py-2"
          style={{ backgroundColor: palette.panel }}
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5">
            <div className="flex min-w-0 flex-col gap-1.5">
              <Dream11TeamRow
                palette={palette}
                shortName={match.homeTeam.shortName}
                name={match.homeTeam.name}
                logoUrl={match.homeTeam.logoUrl}
                primaryColor={match.homeTeam.primaryColor}
                scoreText={showScores ? formatScore(match, 'home') : null}
              />
              <Dream11TeamRow
                palette={palette}
                shortName={match.awayTeam.shortName}
                name={match.awayTeam.name}
                logoUrl={match.awayTeam.logoUrl}
                primaryColor={match.awayTeam.primaryColor}
                scoreText={showScores ? formatScore(match, 'away') : null}
              />
            </div>

            <div className="flex items-stretch self-stretch pl-0.5">
              <div
                className="mr-1.5 w-px shrink-0 self-stretch"
                style={{ backgroundColor: palette.divider }}
                aria-hidden
              />
              <Dream11TimeColumn
                match={match}
                live={live}
                timeStyle={timeStyle}
                palette={palette}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-2.5 pb-2">
        {completed ? (
          <span
            className="text-[11px] font-semibold"
            style={{ color: palette.completed }}
          >
            {match.resultSummary ?? 'Match completed'}
          </span>
        ) : (
          <MegaContestBadge amount={prizeLabel} palette={palette} />
        )}
        <button
          type="button"
          aria-label="Set match reminder"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d82d2c]/30"
          style={{ color: palette.textMuted }}
        >
          <BellPlus className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </article>
  );
};

const isDisplayScore = (scoreText: string | null): boolean => {
  if (!scoreText || scoreText === '—' || scoreText === '0') return false;
  if (/^0\/0(\s|\(|$)/.test(scoreText)) return false;
  return true;
};

const Dream11TeamRow = ({
  palette,
  shortName,
  name,
  logoUrl,
  primaryColor,
  scoreText,
}: {
  palette: Dream11Palette;
  shortName: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  scoreText: string | null;
}): JSX.Element => (
  <div className="flex min-w-0 items-center gap-2">
    <TeamBadge
      shortName={shortName}
      name={name}
      logoUrl={logoUrl}
      primaryColor={primaryColor}
      size="xs"
      className="ring-1 ring-white/20"
    />
    <div className="flex min-w-0 flex-1 items-baseline gap-1 overflow-hidden">
      <span
        className="shrink-0 text-[12px] font-bold leading-none"
        style={{ color: palette.textPrimary }}
      >
        {shortName}
      </span>
      <span
        className="min-w-0 truncate text-[11px] font-normal leading-none"
        style={{ color: palette.textMuted }}
      >
        {name}
      </span>
    </div>
    {isDisplayScore(scoreText) ? (
      <span
        className="shrink-0 text-[11px] font-semibold tabular-nums leading-none"
        style={{ color: palette.textPrimary }}
      >
        {scoreText}
      </span>
    ) : null}
  </div>
);

const Dream11TimeColumn = ({
  match,
  live,
  timeStyle,
  palette,
}: {
  match: SportsMatchSummary;
  live: boolean;
  timeStyle: MatchTimeStyle;
  palette: Dream11Palette;
}): JSX.Element => {
  if (live) {
    return (
      <div className="flex min-w-[62px] flex-col items-end justify-center gap-0.5 text-right">
        <span className="text-[12px] font-bold leading-none" style={{ color: palette.red }}>
          Live
        </span>
        <span
          className="text-[10px] leading-none tabular-nums"
          style={{ color: palette.textTertiary }}
        >
          {formatMatchClock(match.startedAt ?? match.scheduledAt)}
        </span>
      </div>
    );
  }

  if (match.completedAt) {
    return (
      <div className="flex min-w-[62px] flex-col items-end justify-center gap-0.5 text-right">
        <span
          className="text-[12px] font-bold leading-none"
          style={{ color: palette.textPrimary }}
        >
          {matchStatusLabel(match.status)}
        </span>
        <span
          className="text-[10px] leading-none tabular-nums"
          style={{ color: palette.textTertiary }}
        >
          {formatMatchClock(match.completedAt)}
        </span>
      </div>
    );
  }

  if (timeStyle === 'countdown') {
    return <Dream11Countdown scheduledAt={match.scheduledAt} palette={palette} />;
  }

  const hint = formatMatchDayHint(match.scheduledAt, { timeStyle });
  return (
    <div className="flex min-w-[62px] flex-col items-end justify-center gap-0.5 text-right">
      <span
        className="text-[12px] font-bold leading-none tabular-nums"
        style={{ color: palette.red }}
      >
        {hint?.primary ?? 'Today'}
      </span>
      <span
        className="text-[10px] leading-none tabular-nums"
        style={{ color: palette.textTertiary }}
      >
        {formatMatchClock(match.scheduledAt)}
      </span>
    </div>
  );
};

const Dream11Countdown = ({
  scheduledAt,
  palette,
}: {
  scheduledAt: string;
  palette: Dream11Palette;
}): JSX.Element => {
  const { hours, minutes, seconds, isStarted, remainingMs } = useCountdown(scheduledAt);

  if (isStarted) {
    return (
      <div className="flex min-w-[62px] flex-col items-end justify-center gap-0.5 text-right">
        <span className="text-[12px] font-bold leading-none" style={{ color: palette.red }}>
          Live
        </span>
        <span
          className="text-[10px] leading-none tabular-nums"
          style={{ color: palette.textTertiary }}
        >
          {formatMatchClock(scheduledAt)}
        </span>
      </div>
    );
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  let primary = formatMatchClock(scheduledAt);

  if (totalSeconds < 3600) {
    primary = `${minutes}m : ${pad2(seconds)}s`;
  } else if (totalSeconds < 86_400) {
    primary = `${hours}h : ${minutes}m`;
  } else {
    const hint = formatMatchDayHint(scheduledAt, { timeStyle: 'day-label' });
    primary = hint?.primary ?? 'Today';
  }

  return (
    <div className="flex min-w-[62px] flex-col items-end justify-center gap-0.5 text-right">
      <span
        className="text-[12px] font-bold leading-none tabular-nums"
        style={{ color: palette.red }}
      >
        {primary}
      </span>
      <span
        className="text-[10px] leading-none tabular-nums"
        style={{ color: palette.textTertiary }}
      >
        {formatMatchClock(scheduledAt)}
      </span>
    </div>
  );
};

const DefaultCard = ({
  match,
  live,
  prizeLabel,
  timeStyle,
  onClick,
  className,
}: {
  match: SportsMatchSummary;
  live: boolean;
  prizeLabel?: string | null;
  timeStyle: MatchTimeStyle;
  onClick: () => void;
  className?: string;
}): JSX.Element => {
  const completed = !!match.completedAt;
  const sportIcon = SPORT_ICON_HINT[match.sport] ?? '🏏';

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
        'group cursor-pointer overflow-hidden rounded-xl border border-border/80 bg-surface shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-border hover:shadow-md',
        'active:translate-y-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span aria-hidden className="shrink-0 text-sm leading-none">
            {sportIcon}
          </span>
          <Typography variant="caption" tone="muted" className="min-w-0 truncate font-medium">
            {match.format} · {formatTournamentTag(match)}
          </Typography>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-muted" aria-hidden />
        </div>
        <div className="shrink-0">
          {live ? <LiveBadge /> : <Shirt className="h-4 w-4 text-text-muted" aria-hidden />}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-3">
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

        <div className="flex min-w-[72px] items-stretch gap-3">
          <div className="w-px shrink-0 bg-border" aria-hidden />
          <RightColumn match={match} live={live} timeStyle={timeStyle} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-2.5">
        {completed ? (
          <Typography variant="caption" className="font-semibold text-success">
            {match.resultSummary ?? 'Match completed'}
          </Typography>
        ) : (
          <MegaContestBadge amount={prizeLabel} />
        )}
        <button
          type="button"
          aria-label="Set match reminder"
          onClick={(e) => e.stopPropagation()}
          className="rounded-full p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
};

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
      <Typography variant="caption" tone="muted" className="min-w-0 truncate text-[12px]">
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
  timeStyle,
}: {
  match: SportsMatchSummary;
  live: boolean;
  timeStyle: MatchTimeStyle;
}): JSX.Element => {
  if (live) {
    return (
      <div className="flex min-w-[64px] flex-col items-end justify-center gap-1 text-right">
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
      <div className="flex min-w-[64px] flex-col items-end justify-center gap-0.5 text-right">
        <Typography variant="caption" className="font-bold text-text">
          {matchStatusLabel(match.status)}
        </Typography>
        <Typography variant="caption" tone="muted" className="block">
          {formatMatchClock(match.completedAt)}
        </Typography>
      </div>
    );
  }

  const hint = formatMatchDayHint(match.scheduledAt, { timeStyle });
  if (timeStyle === 'countdown') {
    return <LiveUpcomingCountdown scheduledAt={match.scheduledAt} fallback={hint} />;
  }

  const isUrgent = hint?.tone === 'urgent';
  return (
    <div className="flex min-w-[64px] flex-col items-end justify-center gap-0.5 text-right">
      <Typography
        variant="caption"
        className={cn(
          'text-sm font-bold tabular-nums',
          isUrgent ? 'text-danger' : 'text-text',
        )}
      >
        {hint?.primary ?? formatMatchClock(match.scheduledAt)}
      </Typography>
      <Typography variant="caption" tone="muted" className="block tabular-nums">
        {formatMatchClock(match.scheduledAt)}
      </Typography>
    </div>
  );
};

const LiveUpcomingCountdown = ({
  scheduledAt,
  fallback,
}: {
  scheduledAt: string;
  fallback: ReturnType<typeof formatMatchDayHint>;
}): JSX.Element => {
  const { hours, minutes, seconds, isStarted, remainingMs } = useCountdown(scheduledAt);

  if (isStarted) {
    return (
      <div className="flex min-w-[64px] flex-col items-end justify-center gap-0.5 text-right">
        <Typography variant="caption" className="text-sm font-bold text-danger">
          Live
        </Typography>
        <Typography variant="caption" tone="muted" className="block tabular-nums">
          {formatMatchClock(scheduledAt)}
        </Typography>
      </div>
    );
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  let primary = fallback?.primary ?? formatMatchClock(scheduledAt);
  let isUrgent = fallback?.tone === 'urgent';

  if (totalSeconds < 3600) {
    primary = `${minutes}m : ${pad2(seconds)}s`;
    isUrgent = true;
  } else if (totalSeconds < 86_400) {
    primary = `${hours}h : ${minutes}m`;
    isUrgent = true;
  }

  return (
    <div className="flex min-w-[64px] flex-col items-end justify-center gap-0.5 text-right">
      <Typography
        variant="caption"
        className={cn(
          'text-sm font-bold tabular-nums',
          isUrgent ? 'text-danger' : 'text-text',
        )}
      >
        {primary}
      </Typography>
      <Typography variant="caption" tone="muted" className="block tabular-nums">
        {formatMatchClock(scheduledAt)}
      </Typography>
    </div>
  );
};

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
        {formatTournamentTag(match)} · {formatMatchClock(match.scheduledAt)}
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
