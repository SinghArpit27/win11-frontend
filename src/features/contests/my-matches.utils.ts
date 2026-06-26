import type { FantasyTeam } from '@features/fantasy/fantasy.types';
import type { SportsMatchSummary } from '@features/sports/sports.types';
import { isMatchLive } from '@features/sports/sports.utils';
import { ContestEntryStatus, ContestStatus, MatchStatus } from '@shared/enums';

import type { ContestEntry } from './contest.types';

export type MyMatchesTabId = 'upcoming' | 'live' | 'completed';

export interface MyMatchRow {
  match: SportsMatchSummary;
  teamCount: number;
  contestCount: number;
  tab: MyMatchesTabId;
}

export const formatParticipationLabel = (teamCount: number, contestCount: number): string => {
  const teams = teamCount === 1 ? '1 Team' : `${teamCount} Teams`;
  const contests = contestCount === 1 ? '1 Contest' : `${contestCount} Contests`;
  return `${teams} · ${contests}`;
};

const bucketMatch = (match: SportsMatchSummary, entries: ContestEntry[]): MyMatchesTabId => {
  if (isMatchLive(match) || match.status === MatchStatus.LIVE) return 'live';
  if (
    match.status === MatchStatus.COMPLETED ||
    match.status === MatchStatus.CANCELLED ||
    match.status === MatchStatus.ABANDONED ||
    match.completedAt
  ) {
    return 'completed';
  }

  const hasSettledEntry = entries.some(
    (e) =>
      e.status === ContestEntryStatus.SETTLED ||
      e.status === ContestEntryStatus.REFUNDED ||
      e.status === ContestEntryStatus.CANCELLED,
  );
  if (hasSettledEntry) return 'completed';

  const hasLiveContest = entries.some((e) => e.contest?.status === ContestStatus.LIVE);
  if (hasLiveContest) return 'live';

  return 'upcoming';
};

export const buildMyMatchRows = (
  teams: FantasyTeam[],
  entries: ContestEntry[],
  matches: SportsMatchSummary[],
): MyMatchRow[] => {
  const matchIds = new Set<string>();
  for (const team of teams) matchIds.add(team.matchId);
  for (const entry of entries) matchIds.add(entry.matchId);

  const matchById = new Map(matches.map((m) => [m.id, m]));
  const rows: MyMatchRow[] = [];

  for (const matchId of matchIds) {
    const match = matchById.get(matchId);
    if (!match) continue;

    const matchEntries = entries.filter((e) => e.matchId === matchId);
    const teamCount = teams.filter((t) => t.matchId === matchId).length;
    const contestCount = matchEntries.length;

    rows.push({
      match,
      teamCount,
      contestCount,
      tab: bucketMatch(match, matchEntries),
    });
  }

  rows.sort((a, b) => {
    const ta = new Date(a.match.scheduledAt).getTime();
    const tb = new Date(b.match.scheduledAt).getTime();
    return a.tab === 'completed' ? tb - ta : ta - tb;
  });

  return rows;
};
