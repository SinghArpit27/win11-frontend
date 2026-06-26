import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import { buildRoute } from '@utils/routes.util';

/**
 * Legacy route — redirects to Come-style contest detail (Leaderboard tab).
 */
const ContestLeaderboardScreen = (): JSX.Element => {
  const { matchId = '', contestId = '' } = useParams<{
    matchId: string;
    contestId: string;
  }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!matchId || !contestId) return;
    navigate(
      `${buildRoute(ROUTES.CONTEST_DETAIL, { matchId, contestId })}?tab=leaderboard`,
      { replace: true },
    );
  }, [matchId, contestId, navigate]);

  return <div className="min-h-[40vh]" aria-hidden />;
};

export default ContestLeaderboardScreen;
