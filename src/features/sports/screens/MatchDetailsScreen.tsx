import { Navigate, useParams } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import { buildRoute } from '@utils/routes.util';

/** Legacy match detail URL — redirects to the Dream11 contest hub. */
const MatchDetailsScreen = (): JSX.Element => {
  const { matchId = '' } = useParams<{ matchId: string }>();

  if (!matchId) {
    return <Navigate to={ROUTES.MATCHES} replace />;
  }

  return <Navigate to={buildRoute(ROUTES.MATCH_CONTESTS, { matchId })} replace />;
};

export default MatchDetailsScreen;
