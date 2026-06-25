import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageContainer } from '@components/layout';
import { Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { useAppSelector } from '@hooks/index';
import { selectAuthUser } from '@features/auth/auth.slice';

import {
  useListFeaturedMatchesQuery,
  useListLiveMatchesQuery,
  useListTrendingMatchesQuery,
  useListUpcomingMatchesQuery,
} from '../sports.api';
import {
  BannerCarousel,
  MatchListSection,
  WalletSummaryWidget,
} from '../components';

/**
 * Authenticated home dashboard.
 *
 *  Composition order (mobile-first, also the visual scan order on desktop):
 *    1. Greeting + wallet summary widget (glance value)
 *    2. Promo banners placeholder (engagement)
 *    3. Live matches  (urgency / fomo)
 *    4. Upcoming matches (planning)
 *    5. Featured matches (curated quality)
 *    6. Trending matches (social proof)
 *
 *  Each row delegates render+states to `MatchListSection`, which keeps
 *  this screen lean and lets us reuse the same row on dedicated screens.
 *
 *  Performance:
 *   - Each query is its own RTK Query cache key, so loading individual
 *     rows doesn't block the others (independent suspense).
 *   - Live row is the only one with a polling interval (matches API
 *     contract: live cache TTL is short, others are minutes-long).
 */
const HomeScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);

  const liveQuery = useListLiveMatchesQuery(undefined, {
    pollingInterval: 30_000,
  });
  const upcomingQuery = useListUpcomingMatchesQuery({ limit: 8 });
  const featuredQuery = useListFeaturedMatchesQuery({ limit: 6 });
  const trendingQuery = useListTrendingMatchesQuery({ limit: 6 });

  const greeting = useMemo(
    () => greet(user?.displayName ?? user?.username ?? null),
    [user?.displayName, user?.username],
  );

  return (
    <PageContainer as="div" className="gap-6 lg:gap-8">
      <header className="flex flex-col gap-1">
        <Typography variant="overline" tone="muted">
          {greeting.eyebrow}
        </Typography>
        <Typography
          variant="h1"
          className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
        >
          {greeting.title}
        </Typography>
        <Typography variant="body" tone="muted">
          Live action, upcoming fixtures, and your wallet — all in one place.
        </Typography>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <WalletSummaryWidget className="lg:col-span-1" />
        <BannerCarousel
          className="lg:col-span-2"
          onCta={(b) => {
            if (b.id === 'safe') navigate(ROUTES.WALLET);
            else navigate(ROUTES.MATCHES);
          }}
        />
      </div>

      <MatchListSection
        title="Live now"
        subtitle="Matches in progress — tap to follow the action."
        matches={liveQuery.data}
        loading={liveQuery.isLoading}
        emptyHint="No matches are live right now. Check back closer to fixture time."
        onViewAll={() => navigate(`${ROUTES.MATCHES}?status=LIVE`)}
      />

      <MatchListSection
        title="Upcoming"
        subtitle="Fixtures starting soon."
        matches={upcomingQuery.data}
        loading={upcomingQuery.isLoading}
        emptyHint="No upcoming matches in this window."
        onViewAll={() => navigate(`${ROUTES.MATCHES}?status=UPCOMING`)}
      />

      <MatchListSection
        title="Featured"
        subtitle="Hand-picked marquee fixtures."
        matches={featuredQuery.data}
        loading={featuredQuery.isLoading}
        emptyHint="Editorial picks will appear here closer to match day."
        onViewAll={() => navigate(`${ROUTES.MATCHES}?featured=true`)}
      />

      <MatchListSection
        title="Trending"
        subtitle="Most-followed matches right now."
        matches={trendingQuery.data}
        loading={trendingQuery.isLoading}
        compact
        emptyHint="Nothing trending yet — be the first to follow a match."
      />
    </PageContainer>
  );
};

/**
 *  Localised-style greeting helper. Kept pure so it stays trivially
 *  testable and easily replaced by a real i18n string at Phase 8.
 */
const greet = (name: string | null): { eyebrow: string; title: string } => {
  const hour = new Date().getHours();
  const slot = hour < 5 ? 'evening' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = name ? name.split(' ')[0] : null;
  return {
    eyebrow: `Good ${slot}`,
    title: firstName ? `Hey, ${firstName}` : 'Welcome back',
  };
};

export default HomeScreen;
