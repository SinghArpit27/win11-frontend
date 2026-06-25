import { useEffect } from 'react';

import { useAppSelector } from '@hooks/index';
import { errorReporter } from '@services/logging';

import { selectAuthUser } from './auth.slice';

/**
 * Keeps the error-reporting transport in sync with the auth slice so
 * every captured exception is automatically tagged with the current
 * user. Mount once near the application root.
 */
export const useAuthReporterSync = (): void => {
  const user = useAppSelector(selectAuthUser);
  useEffect(() => {
    errorReporter.setUser(
      user
        ? {
            id: user.id,
            email: user.email,
            username: user.username,
            roles: user.roles,
          }
        : null,
    );
  }, [user]);
};
