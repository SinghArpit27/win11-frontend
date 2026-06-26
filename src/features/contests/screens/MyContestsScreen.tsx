import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { QueryErrorState } from '@components/common/QueryErrorState';
import { Skeleton } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { MatchCard } from '@features/sports/components/MatchCard';
import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';
import { buildRoute } from '@utils/routes.util';

import { MyMatchesEmptyState, MyMatchesTabs } from '../components';
import { useMyMatches } from '../hooks/useMyMatches';
import { formatParticipationLabel, type MyMatchesTabId } from '../my-matches.utils';

/**
 * My Matches — user's matches with teams/contests, bucketed Upcoming / Live / Completed.
 */
const MyContestsScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const palette = useDream11Palette();
  const [tab, setTab] = useState<MyMatchesTabId>('upcoming');
  const { isLoading, isError, refetch, rowsByTab } = useMyMatches();

  const items = rowsByTab[tab];

  return (
    <div
      className="flex min-h-full flex-col pb-24"
      style={{ backgroundColor: palette.greyBg }}
    >
      <div className="sticky top-0 z-20 px-3 pb-3 pt-3 sm:px-4">
        <MyMatchesTabs active={tab} onChange={setTab} />
      </div>

      <div className="flex flex-1 flex-col px-3 sm:px-4">
        {isError ? (
          <QueryErrorState
            title="Unable to load your matches"
            onRetry={refetch}
            className="mt-4"
          />
        ) : isLoading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <MyMatchesEmptyState />
        ) : (
          <div className="flex flex-col gap-2.5 pb-4">
            {items.map(({ match, teamCount, contestCount }) => (
              <MatchCard
                key={match.id}
                match={match}
                appearance="dream11"
                timeStyle="countdown"
                participationLabel={formatParticipationLabel(teamCount, contestCount)}
                onClick={() =>
                  navigate(buildRoute(ROUTES.MATCH_CONTESTS, { matchId: match.id }))
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ListSkeleton = (): JSX.Element => (
  <div className="flex flex-col gap-2.5 pt-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-[132px] w-full rounded-[10px]" />
    ))}
  </div>
);

export { MyContestsScreen };
export default MyContestsScreen;
