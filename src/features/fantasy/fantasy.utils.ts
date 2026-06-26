import type { MatchFormat } from '@shared/enums';

import type { StatsTabItem } from './components/StatsTabs';
import type { FantasyMatchContext, FantasyMatchPlayer } from './fantasy.types';

/** Dream11-style match insight strip under the create-team header. */
export const buildFantasyMatchStats = (ctx: FantasyMatchContext): StatsTabItem[] => {
  const format = ctx.format as MatchFormat;
  const pitch = PITCH_BY_FORMAT[format] ?? 'Balanced';
  const goodFor = GOOD_FOR_BY_FORMAT[format] ?? 'Balance';
  const avgScore = AVG_SCORE_BY_FORMAT[format] ?? 140;

  const items: StatsTabItem[] = [
    { id: 'pitch', label: `Pitch: ${pitch}` },
    { id: 'goodFor', label: `Good For: ${goodFor}` },
    { id: 'avgScore', label: `Avg Score: ${avgScore}` },
  ];

  const venue = ctx.match?.venue?.name;
  if (venue) items.push({ id: 'venue', label: `Venue: ${venue}` });

  return items;
};

/** Pitch "Good For" label used in stats strip and footer hints. */
export const getPitchGoodFor = (ctx: FantasyMatchContext): string => {
  const format = ctx.format as MatchFormat;
  return GOOD_FOR_BY_FORMAT[format] ?? 'Pacer';
};

const PITCH_BY_FORMAT: Partial<Record<MatchFormat, string>> = {
  T20: 'Bowling',
  T10: 'Bowling',
  ODI: 'Batting',
  TEST: 'Batting',
  HUNDRED: 'Bowling',
};

const GOOD_FOR_BY_FORMAT: Partial<Record<MatchFormat, string>> = {
  T20: 'Pacer',
  T10: 'Pacer',
  ODI: 'Spin',
  TEST: 'Pacer',
  HUNDRED: 'Pacer',
};

const AVG_SCORE_BY_FORMAT: Partial<Record<MatchFormat, number>> = {
  T20: 160,
  T10: 115,
  ODI: 280,
  TEST: 320,
  HUNDRED: 140,
};

export type PlayerSortField = 'credits' | 'selectionPercent' | 'points' | 'runs' | 'wickets';

/** Sort players for the role-filtered single-column list. */
export const sortFantasyPlayers = (
  players: FantasyMatchPlayer[],
  field: PlayerSortField,
  direction: 'asc' | 'desc' = 'desc',
): FantasyMatchPlayer[] => {
  const mul = direction === 'asc' ? 1 : -1;
  return [...players].sort((a, b) => {
    switch (field) {
      case 'credits':
        return mul * (a.credits - b.credits);
      case 'selectionPercent':
        return mul * ((a.selectionPercent ?? 0) - (b.selectionPercent ?? 0));
      case 'points':
      case 'runs':
      case 'wickets':
        return 0;
      default:
        return 0;
    }
  });
};

export const isPlayerPickDisabled = (
  player: FantasyMatchPlayer,
  opts: {
    isSelected: boolean;
    matchLocked: boolean;
    creditsUsed: number;
    creditBudget: number;
    roleCount: number;
    roleCap: number;
    teamCount: number;
    maxFromSingleTeam: number;
    totalSelected: number;
    teamSize: number;
  },
): boolean => {
  const {
    isSelected,
    matchLocked,
    creditsUsed,
    creditBudget,
    roleCount,
    roleCap,
    teamCount,
    maxFromSingleTeam,
    totalSelected,
    teamSize,
  } = opts;

  if (matchLocked) return true;
  if (isSelected) return false;

  const wouldExceedCredits = creditsUsed + player.credits > creditBudget;
  const wouldExceedRole = roleCount >= roleCap;
  const wouldExceedTeam = teamCount >= maxFromSingleTeam;
  const sizeAtCap = totalSelected >= teamSize;

  return sizeAtCap || wouldExceedRole || wouldExceedTeam || wouldExceedCredits;
};
