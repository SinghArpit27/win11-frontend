import { describe, expect, it } from 'vitest';

import { ContestStatus } from '@shared/enums';

import type { ContestSummary } from './contest.types';
import { canJoinContest, isJoinWindowOpen, resolveJoinClosesAt } from './contest.utils';

const baseContest = (): ContestSummary & { match?: { scheduledAt: string; lineupLockedAt: string | null } } => ({
  id: '1',
  matchId: 'm1',
  sport: 'CRICKET' as ContestSummary['sport'],
  format: 'T20' as ContestSummary['format'],
  name: 'Test',
  description: null,
  type: 'MEGA' as ContestSummary['type'],
  visibility: 'PUBLIC' as ContestSummary['visibility'],
  status: ContestStatus.OPEN,
  isPractice: false,
  isGuaranteed: false,
  entryFee: 100,
  prizePoolAmount: 10000,
  currency: 'INR',
  topPrize: 5000,
  totalSpots: 100,
  filledSpots: 0,
  spotsLeft: 100,
  fillPercentage: 0,
  maxEntriesPerUser: 5,
  joinOpensAt: null,
  joinClosesAt: '2026-05-28T00:00:00.000Z',
  publishedAt: null,
  hasInviteCode: false,
  version: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  match: {
    id: 'm1',
    sport: 'CRICKET' as ContestSummary['sport'],
    format: 'T20' as ContestSummary['format'],
    scheduledAt: '2026-06-28T06:35:00.000Z',
    lineupLockedAt: null,
    status: 'UPCOMING',
    homeTeam: null,
    awayTeam: null,
  },
});

describe('contest join window helpers', () => {
  it('resolveJoinClosesAt prefers later match schedule over stale contest close', () => {
    const contest = baseContest();
    expect(resolveJoinClosesAt(contest)).toBe('2026-06-28T06:35:00.000Z');
  });

  it('isJoinWindowOpen returns true when match is in the future', () => {
    const contest = baseContest();
    const now = new Date('2026-06-25T00:00:00.000Z');
    expect(isJoinWindowOpen(contest, now)).toBe(true);
  });

  it('canJoinContest requires OPEN status and open window', () => {
    const contest = baseContest();
    expect(canJoinContest(contest)).toBe(true);
    contest.status = ContestStatus.FULL;
    expect(canJoinContest(contest)).toBe(false);
  });
});
