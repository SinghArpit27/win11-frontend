import { appConfig } from '@config/index';

import { MatchStatus, Sport } from '@shared/enums';

import type { SportsMatchSummary } from './sports.types';

/**
 * Sports formatters + small helpers.
 *
 * Centralised so every screen / card formats dates, scores, and labels
 * the same way. The backend wire format remains stable (ISO strings,
 * integer scores) — these utilities are presentation-only.
 */

/**
 * Human-readable label for each sport. Used in filter chips + tournament
 * cards. Avoids hardcoded strings in components.
 */
export const SPORT_LABELS: Record<Sport, string> = {
  [Sport.CRICKET]: 'Cricket',
  [Sport.FOOTBALL]: 'Football',
  [Sport.KABADDI]: 'Kabaddi',
  [Sport.BASKETBALL]: 'Basketball',
};

export const SPORT_ICON_HINT: Record<Sport, string> = {
  [Sport.CRICKET]: '🏏',
  [Sport.FOOTBALL]: '⚽',
  [Sport.KABADDI]: '🤼',
  [Sport.BASKETBALL]: '🏀',
};

/** "MI vs CSK" short label using short codes. */
export const formatMatchTitle = (match: SportsMatchSummary): string =>
  `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`;

/**
 * Tournament tag rendered next to the format pill.
 *
 *   T20 · `<tournament name>`, `<season>`
 *
 * Each piece is optional — if the API hasn't supplied a season we drop
 * the suffix gracefully.
 */
export const formatTournamentTag = (
  match: Pick<SportsMatchSummary, 'tournament'>,
): string => {
  const name = match.tournament.shortName || match.tournament.name;
  const season = match.tournament.season?.trim();
  if (!season) return name;
  if (name.includes(season)) return name;
  return `${name}, ${season}`;
};

/**
 * Smart countdown / day label used in the right column of the match card.
 *
 *   < 1 hour  → "8m : 10s"  (urgent, red)
 *   < 24 h    → "2h 14m"
 *   tomorrow  → "Tomorrow"
 *   this week → "Sat"
 *   later     → "27 May"
 *
 * Returns `null` if the timestamp is invalid or already started.
 */
export interface MatchDayHint {
  primary: string;
  tone: 'urgent' | 'soon' | 'later';
}

export type MatchTimeStyle = 'countdown' | 'day-label';

export const formatMatchDayHint = (
  iso: string,
  options?: { timeStyle?: MatchTimeStyle },
): MatchDayHint | null => {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return null;

  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round(
    (startOfDay(target).getTime() - startOfDay(now).getTime()) / (24 * 60 * 60 * 1000),
  );

  if (options?.timeStyle === 'day-label') {
    if (dayDiff === 0) return { primary: 'Today', tone: 'soon' };
    if (dayDiff === 1) return { primary: 'Tomorrow', tone: 'soon' };
  }

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return { primary: `${m}m : ${pad2(s)}s`, tone: 'urgent' };
  }
  if (seconds < 86_400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return { primary: `${h}h : ${m}m`, tone: 'urgent' };
  }

  if (dayDiff === 1) return { primary: 'Tomorrow', tone: 'soon' };
  if (dayDiff > 1 && dayDiff < 7) {
    return {
      primary: new Intl.DateTimeFormat(appConfig.defaultLocale, { weekday: 'short' }).format(target),
      tone: 'soon',
    };
  }
  return {
    primary: new Intl.DateTimeFormat(appConfig.defaultLocale, { day: 'numeric', month: 'short' }).format(target),
    tone: 'later',
  };
};

/** Just the time portion, e.g. "6:00 PM". */
export const formatMatchClock = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const formatted = new Intl.DateTimeFormat(appConfig.defaultLocale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
  return formatted.replace(/\s?(am|pm)$/i, (_, meridiem: string) => ` ${meridiem.toUpperCase()}`);
};

/**
 * "Tomorrow · 7:30 PM" relative label for upcoming matches. Falls back
 * to the absolute date for anything > 6 days away.
 */
export const formatMatchTime = (iso: string): string => {
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return '';

  const now = new Date();
  const startOfDay = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round(
    (startOfDay(target).getTime() - startOfDay(now).getTime()) / (24 * 60 * 60 * 1000),
  );

  const timePart = new Intl.DateTimeFormat(appConfig.defaultLocale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(target);

  if (dayDiff === 0) return `Today · ${timePart}`;
  if (dayDiff === 1) return `Tomorrow · ${timePart}`;
  if (dayDiff > 1 && dayDiff < 7) {
    const day = new Intl.DateTimeFormat(appConfig.defaultLocale, { weekday: 'short' }).format(target);
    return `${day} · ${timePart}`;
  }
  if (dayDiff < 0) return formatAbsoluteDate(iso);
  return formatAbsoluteDate(iso);
};

export const formatAbsoluteDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(appConfig.defaultLocale, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
};

/** "152/4 (17.2)" cricket-style or "2 - 1" for goal sports. */
export const formatScore = (
  match: SportsMatchSummary,
  side: 'home' | 'away',
): string => {
  const teamId = side === 'home' ? match.homeTeam.id : match.awayTeam.id;
  const entry = match.scores.find((s) => s.teamId === teamId);
  if (!entry) return '—';

  // Cricket score: "152/4 (17.2)"
  if (match.sport === Sport.CRICKET) {
    const wickets =
      typeof entry.secondary === 'number' ? `/${entry.secondary}` : '';
    const overs = entry.overs ? ` (${entry.overs})` : '';
    return `${entry.score}${wickets}${overs}`;
  }
  return String(entry.score);
};

export const isMatchTerminal = (status: MatchStatus): boolean =>
  status === MatchStatus.COMPLETED ||
  status === MatchStatus.CANCELLED ||
  status === MatchStatus.ABANDONED;

export const isMatchLive = (match: SportsMatchSummary): boolean =>
  match.status === MatchStatus.LIVE;

export const matchStatusLabel = (status: MatchStatus): string => {
  switch (status) {
    case MatchStatus.LIVE:
      return 'Live';
    case MatchStatus.UPCOMING:
      return 'Upcoming';
    case MatchStatus.COMPLETED:
      return 'Completed';
    case MatchStatus.CANCELLED:
      return 'Cancelled';
    case MatchStatus.ABANDONED:
      return 'Abandoned';
    default:
      return status;
  }
};

/**
 * Two-digit padded number for countdown HUDs.
 */
export const pad2 = (n: number): string =>
  n < 0 ? '00' : n < 10 ? `0${n}` : String(n);
