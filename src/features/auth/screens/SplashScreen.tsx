import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import { selectIsAdmin, selectIsAuthenticated } from '@features/auth/auth.slice';
import { useAppSelector } from '@hooks/index';

import MobileWelcomeScreen from './MobileWelcomeScreen';

/**
 * Landing screen — Dream11-style welcome with Let's Play → phone sign-in.
 */
export const SplashScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  const returnTo = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (!isAuthenticated) return;
    if (returnTo) {
      navigate(returnTo, { replace: true });
      return;
    }
    navigate(isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME, { replace: true });
  }, [isAuthenticated, isAdmin, navigate, returnTo]);

  if (isAuthenticated) {
    return <div className="min-h-[100dvh] bg-[#e02020]" />;
  }

  return (
    <MobileWelcomeScreen
      onLetsPlay={() =>
        navigate(ROUTES.LOGIN, {
          replace: true,
          state: returnTo ? { from: returnTo } : undefined,
        })
      }
    />
  );
};

export default SplashScreen;
