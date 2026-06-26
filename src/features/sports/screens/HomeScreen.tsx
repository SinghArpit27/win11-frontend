import { useMemo, useState } from 'react';

import { PageContainer } from '@components/layout';
import { useListContestsQuery } from '@features/contests/contest.api';
import { formatMegaPrizeLabel } from '@features/contests/contest.utils';

import {
  useListFeaturedMatchesQuery,
  useListLiveMatchesQuery,
  useListTrendingMatchesQuery,
  useListUpcomingMatchesQuery,
} from '../sports.api';
import type { SportsMatchSummary } from '../sports.types';
import { HomeMatchTabs, type HomeMatchTab } from '../components/HomeMatchTabs';
import { MatchCard } from '../components/MatchCard';
import { useDream11Palette } from '../hooks/useDream11Palette';

const TAB_TIME_STYLE: Record<HomeMatchTab, 'countdown' | 'day-label'> = {
  recommended: 'countdown',
  'starting-soon': 'countdown',
  popular: 'day-label',
};

/**
 * Authenticated home — Dream11-style tabbed match feed.
 *
 *  Tabs:
 *    - Recommended  → live + featured + upcoming fixtures
 *    - Starting Soon → upcoming sorted by kick-off
 *    - Popular      → trending fixtures
 *
 *  Prize pools are aggregated from open contests per match.
 */
const HomeScreen = (): JSX.Element => {
  const palette = useDream11Palette();
  const [tab, setTab] = useState<HomeMatchTab>('recommended');

  const liveQuery = useListLiveMatchesQuery(undefined, { pollingInterval: 30_000 });
  const upcomingQuery = useListUpcomingMatchesQuery({ limit: 20 });
  const featuredQuery = useListFeaturedMatchesQuery({ limit: 20 });
  const trendingQuery = useListTrendingMatchesQuery({ limit: 20 });
  const contestsQuery = useListContestsQuery({ limit: 100 });

  const prizeByMatchId = useMemo(() => {
    const map = new Map<string, { amount: number; currency: string }>();
    for (const contest of contestsQuery.data?.items ?? []) {
      const existing = map.get(contest.matchId);
      if (!existing || contest.prizePoolAmount > existing.amount) {
        map.set(contest.matchId, {
          amount: contest.prizePoolAmount,
          currency: contest.currency,
        });
      }
    }
    return map;
  }, [contestsQuery.data]);

  const matches = useMemo(
    () => resolveTabMatches(tab, {
      live: liveQuery.data,
      featured: featuredQuery.data,
      upcoming: upcomingQuery.data,
      trending: trendingQuery.data,
    }),
    [tab, liveQuery.data, featuredQuery.data, upcomingQuery.data, trendingQuery.data],
  );

  const loading = resolveTabLoading(tab, {
    live: liveQuery.isLoading,
    featured: featuredQuery.isLoading,
    upcoming: upcomingQuery.isLoading,
    trending: trendingQuery.isLoading,
  });

  return (
    <PageContainer
      as="main"
      padded={false}
      width="wide"
      className="mx-0 min-h-full w-full max-w-none !px-0"
      style={{ backgroundColor: palette.greyBg }}
    >
      <HomeMatchTabs active={tab} onChange={setTab} />

      <div className="flex flex-col gap-2 px-2 py-2">
        {loading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[130px] w-full animate-pulse rounded-[10px] border"
                style={{
                  borderColor: palette.border,
                  backgroundColor: palette.card,
                }}
              />
            ))}
          </>
        ) : null}

        {!loading && matches.length === 0 ? (
          <div
            className="rounded-xl border border-dashed px-4 py-12 text-center"
            style={{
              borderColor: palette.border,
              backgroundColor: palette.card,
              color: palette.textMuted,
            }}
          >
            <p className="text-sm">{emptyHintForTab(tab)}</p>
          </div>
        ) : null}

        {!loading
          ? matches.map((match) => {
              const prize = prizeByMatchId.get(match.id);
              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  appearance="dream11"
                  prizeLabel={
                    prize ? formatMegaPrizeLabel(prize.amount, prize.currency) : null
                  }
                  timeStyle={TAB_TIME_STYLE[tab]}
                />
              );
            })
          : null}
      </div>
    </PageContainer>
  );
};

interface TabMatchSources {
  live: SportsMatchSummary[] | undefined;
  featured: SportsMatchSummary[] | undefined;
  upcoming: SportsMatchSummary[] | undefined;
  trending: SportsMatchSummary[] | undefined;
}

const resolveTabMatches = (
  tab: HomeMatchTab,
  sources: TabMatchSources,
): SportsMatchSummary[] => {
  switch (tab) {
    case 'recommended': {
      const live = sources.live ?? [];
      const featured = sources.featured ?? [];
      const upcoming = sources.upcoming ?? [];
      const seen = new Set<string>();
      const merged: SportsMatchSummary[] = [];
      for (const match of [...live, ...featured, ...upcoming]) {
        if (seen.has(match.id)) continue;
        seen.add(match.id);
        merged.push(match);
      }
      return merged;
    }
    case 'starting-soon':
      return [...(sources.upcoming ?? [])].sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      );
    case 'popular':
      return sources.trending ?? [];
    default:
      return [];
  }
};

const resolveTabLoading = (
  tab: HomeMatchTab,
  flags: { live: boolean; featured: boolean; upcoming: boolean; trending: boolean },
): boolean => {
  switch (tab) {
    case 'recommended':
      return flags.live || flags.featured || flags.upcoming;
    case 'starting-soon':
      return flags.upcoming;
    case 'popular':
      return flags.trending;
    default:
      return false;
  }
};

const emptyHintForTab = (tab: HomeMatchTab): string => {
  switch (tab) {
    case 'recommended':
      return 'No recommended matches right now. Check back closer to match day.';
    case 'starting-soon':
      return 'No fixtures starting soon.';
    case 'popular':
      return 'Nothing trending yet — be the first to follow a match.';
    default:
      return 'No matches to show.';
  }
};

export default HomeScreen;
