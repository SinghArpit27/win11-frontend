import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@hooks/index';

import { authStorage } from './auth.storage';
import { useLoginMutation, useLogoutMutation, useSignupMutation } from './auth.api';
import {
  authSucceeded,
  loggedOut,
  selectAuthStatus,
  selectAuthUser,
  selectIsAdmin,
  selectIsAuthenticated,
  selectUserRoles,
} from './auth.slice';
import type { LoginRequest, SignupRequest } from './auth.types';

/**
 * Top-level auth hook used by screens and guards.
 *
 * Returns a small, stable API:
 *  - `status`, `user`, `roles`, `isAdmin`, `isAuthenticated` (state),
 *  - `login`, `signup`, `logout` (commands that handle slice updates).
 *
 * UI components should NEVER dispatch slice actions directly — go
 * through these methods so persistence + tag invalidation stay aligned.
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectAuthUser);
  const roles = useAppSelector(selectUserRoles);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);

  const [loginMutation, loginState] = useLoginMutation();
  const [signupMutation, signupState] = useSignupMutation();
  const [logoutMutation, logoutState] = useLogoutMutation();

  const login = useCallback(
    async (input: LoginRequest) => {
      const result = await loginMutation(input).unwrap();
      dispatch(authSucceeded(result));
      return result;
    },
    [dispatch, loginMutation],
  );

  const signup = useCallback(async (input: SignupRequest) => {
    const result = await signupMutation(input).unwrap();
    // Defer session creation until OTP verification — keeps /auth/otp reachable
    // and avoids PublicOnlyRoute bouncing the user away with a blank Navigate.
    authStorage.setPendingSignup(result);
    return result;
  }, [signupMutation]);

  const logout = useCallback(
    async (allDevices?: boolean) => {
      try {
        await logoutMutation({ allDevices }).unwrap();
      } finally {
        dispatch(loggedOut());
      }
    },
    [dispatch, logoutMutation],
  );

  return {
    status,
    user,
    roles,
    isAuthenticated,
    isAdmin,
    login,
    signup,
    logout,
    flags: {
      loginPending: loginState.isLoading,
      signupPending: signupState.isLoading,
      logoutPending: logoutState.isLoading,
    },
  } as const;
};
