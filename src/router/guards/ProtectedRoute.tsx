import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import { useAppSelector } from '@hooks/index';
import { selectIsAuthenticated } from '@features/auth/auth.slice';

/**
 * Guards a sub-tree behind authentication. Unauthenticated callers are
 * redirected to `/auth/login` with the original path stashed in
 * `location.state.from` so the login screen can bounce them back.
 */
export const ProtectedRoute = (): JSX.Element => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  return <Outlet />;
};
