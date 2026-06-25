import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_NAME, APP_TAGLINE, STORAGE_KEYS } from '@constants/app.constants';
import { ROUTES } from '@constants/routes.constants';
import { useAppSelector } from '@hooks/index';
import { localStore } from '@services/storage';

import { selectIsAuthenticated } from '../auth.slice';

/**
 * Boot/splash screen. Decides where to send the user after the brand
 * flash:
 *  - authed → home,
 *  - never-seen-onboarding → onboarding,
 *  - default → login.
 *
 * The redirect runs after a short delay so the brand animation has a
 * chance to play; bumping `setTimeout` lets product tune the feel.
 */
export const SplashScreen = (): JSX.Element => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (isAuthenticated) {
        navigate(ROUTES.HOME, { replace: true });
        return;
      }
      const seen = localStore.get<boolean>(STORAGE_KEYS.ONBOARDING_SEEN);
      navigate(seen ? ROUTES.LOGIN : ROUTES.ONBOARDING, { replace: true });
    }, 900);
    return () => window.clearTimeout(t);
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-bg text-text">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <span className="text-4xl font-bold text-primary">{APP_NAME}</span>
        <span className="mt-2 text-xs uppercase tracking-[0.22em] text-text-muted">
          {APP_TAGLINE}
        </span>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
