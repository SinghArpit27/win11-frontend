import type { ContestSummary } from '../contest.types';

export type EntryFeeRange = '1-50' | '51-100' | '101-500' | '501-1000' | '1001+';
export type PrizePoolRange = '1-10k' | '10k-50k' | '50k-1L' | '1L+';
export type SpotsRange = '2' | '3-10' | '11-100' | '101-1000' | '1001+';

export interface Dream11AdvancedFilters {
  entryFee: EntryFeeRange | null;
  prizePool: PrizePoolRange | null;
  spots: SpotsRange | null;
}

export const EMPTY_ADVANCED_FILTERS: Dream11AdvancedFilters = {
  entryFee: null,
  prizePool: null,
  spots: null,
};

const MAJOR = 100;

const entryFeeMajor = (minor: number): number => minor / MAJOR;
const poolMajor = (minor: number): number => minor / MAJOR;

const matchesEntryFee = (entryFee: number, range: EntryFeeRange): boolean => {
  const m = entryFeeMajor(entryFee);
  switch (range) {
    case '1-50':
      return m >= 1 && m <= 50;
    case '51-100':
      return m >= 51 && m <= 100;
    case '101-500':
      return m >= 101 && m <= 500;
    case '501-1000':
      return m >= 501 && m <= 1000;
    case '1001+':
      return m >= 1001;
    default:
      return true;
  }
};

const matchesPrizePool = (pool: number, range: PrizePoolRange): boolean => {
  const m = poolMajor(pool);
  switch (range) {
    case '1-10k':
      return m >= 1 && m <= 10_000;
    case '10k-50k':
      return m >= 10_001 && m <= 50_000;
    case '50k-1L':
      return m >= 50_001 && m <= 1_00_000;
    case '1L+':
      return m >= 1_00_001;
    default:
      return true;
  }
};

const matchesSpots = (totalSpots: number, range: SpotsRange): boolean => {
  switch (range) {
    case '2':
      return totalSpots === 2;
    case '3-10':
      return totalSpots >= 3 && totalSpots <= 10;
    case '11-100':
      return totalSpots >= 11 && totalSpots <= 100;
    case '101-1000':
      return totalSpots >= 101 && totalSpots <= 1000;
    case '1001+':
      return totalSpots >= 1001;
    default:
      return true;
  }
};

export const countAdvancedFilters = (filters: Dream11AdvancedFilters): number =>
  [filters.entryFee, filters.prizePool, filters.spots].filter(Boolean).length;

export const applyDream11AdvancedFilters = (
  contests: ContestSummary[],
  filters: Dream11AdvancedFilters,
): ContestSummary[] =>
  contests.filter((c) => {
    if (filters.entryFee && !matchesEntryFee(c.entryFee, filters.entryFee)) return false;
    if (filters.prizePool && !matchesPrizePool(c.prizePoolAmount, filters.prizePool)) return false;
    if (filters.spots && !matchesSpots(c.totalSpots, filters.spots)) return false;
    return true;
  });
