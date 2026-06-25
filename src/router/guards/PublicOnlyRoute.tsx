import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import { authStorage } from '@features/auth/auth.storage';
import { selectAuthUser, selectIsAdmin, selectIsAuthenticated } from '@features/auth/auth.slice';
import { useAppSelector } from '@hooks/index';
import { UserStatus } from '@shared/enums';

const VERIFICATION_PATHS = new Set<string>([ROUTES.OTP_VERIFY, ROUTES.VERIFY_EMAIL]);

/**
 * Wraps routes that should ONLY be visible while logged-out (login,
 * signup, password recovery). Authenticated callers bounce back to home
 * (or admin dashboard for admin-tier roles).
 *
 * Verification routes stay reachable while signup OTP is pending or the
 * account still needs email/phone confirmation.
 */
export const PublicOnlyRoute = (): JSX.Element => {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const user = useAppSelector(selectAuthUser);

  const isVerificationPath = VERIFICATION_PATHS.has(location.pathname);
  const needsVerification =
    user?.status === UserStatus.PENDING_VERIFICATION ||
    (!!user?.email && !user.emailVerified) ||
    (!!user?.phone && !user.phoneVerified);
  const pendingSignup = authStorage.hasPendingSignup();

  const allowVerificationFlow =
    isVerificationPath && (pendingSignup || (isAuthenticated && needsVerification));

  if (isAuthenticated && !allowVerificationFlow) {
    return <Navigate to={isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME} replace />;
  }

  return <Outlet />;
};
