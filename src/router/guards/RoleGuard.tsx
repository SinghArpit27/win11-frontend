import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import { useAppSelector } from '@hooks/index';
import { selectIsAuthenticated, selectUserRoles } from '@features/auth/auth.slice';
import { UserRole } from '@shared/enums';

interface RoleGuardProps {
  allow: UserRole[];
  /** If `true`, unauthenticated users go to the FORBIDDEN screen rather
   * than the login screen — handy for ambiguous links shared via email. */
  forbidUnauthenticated?: boolean;
}

/**
 * RBAC route guard. Pass a list of roles allowed to access the subtree.
 *
 * Auth check is performed first; unauthenticated callers are redirected
 * to login (with `from`). Authenticated-but-unauthorized callers go to
 * `/forbidden` so the route tree itself doesn't leak that something
 * exists at that URL.
 */
export const RoleGuard = ({
  allow,
  forbidUnauthenticated = false,
}: RoleGuardProps): JSX.Element => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const roles = useAppSelector(selectUserRoles);

  if (!isAuthenticated) {
    if (forbidUnauthenticated) return <Navigate to={ROUTES.FORBIDDEN} replace />;
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  const allowed = roles.some((r) => allow.includes(r));
  if (!allowed) return <Navigate to={ROUTES.FORBIDDEN} replace />;
  return <Outlet />;
};
