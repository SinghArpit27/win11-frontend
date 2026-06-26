/**
 * Central route registry. Phase 1 ships only the foundation routes
 * (home/explore/wallet/profile placeholders). Feature routes are added
 * by their owning phases.
 *
 * Each value MUST start with `/` so it works as both a React Router
 * `path` and an `<a href>` target.
 */
export const ROUTES = {
  // Public + user-app
  ROOT: '/',
  SPLASH: '/splash',
  ONBOARDING: '/onboarding',
  LOGIN: '/auth/login',
  /** Alias — phone OTP is the only sign-in method. */
  PHONE_AUTH: '/auth/login',
  SIGNUP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  OTP_VERIFY: '/auth/otp',
  VERIFY_EMAIL: '/auth/verify-email',

  // Authenticated user app
  HOME: '/home',
  EXPLORE: '/explore',
  WALLET: '/wallet',
  WALLET_HISTORY: '/wallet/history',
  WALLET_FINANCIAL: '/wallet/financial',
  KYC: '/kyc',
  PROFILE: '/profile',

  // PHASE 4 — Sports
  MATCHES: '/matches',
  MATCH_DETAIL: '/matches/:matchId',

  // PHASE 5 — Fantasy
  FANTASY_MY_TEAMS: '/matches/:matchId/my-teams',
  FANTASY_CREATE_TEAM: '/matches/:matchId/create-team',
  FANTASY_EDIT_TEAM: '/matches/:matchId/teams/:teamId/edit',
  FANTASY_CLONE_TEAM: '/matches/:matchId/teams/:teamId/clone',
  FANTASY_CAPTAINS: '/matches/:matchId/captains',
  FANTASY_PREVIEW: '/matches/:matchId/preview',
  FANTASY_TEAM_DETAIL: '/matches/:matchId/teams/:teamId',
  ADMIN_FANTASY_RULES: '/admin/fantasy/rules',
  ADMIN_FANTASY_SCORING: '/admin/fantasy/scoring',

  // PHASE 6 — Contests
  MY_CONTESTS: '/my-contests',
  MATCH_CONTESTS: '/matches/:matchId/contests',
  CONTEST_DETAIL: '/matches/:matchId/contests/:contestId',
  CONTEST_JOIN: '/matches/:matchId/contests/:contestId/join',
  ADMIN_CONTESTS: '/admin/contests',
  ADMIN_CONTEST_TEMPLATES: '/admin/contests/templates',
  ADMIN_PRIZE_DISTRIBUTIONS: '/admin/contests/prizes',

  // PHASE 7 — Leaderboard + rankings
  CONTEST_LEADERBOARD: '/matches/:matchId/contests/:contestId/leaderboard',
  MY_RANKINGS: '/rankings',
  ADMIN_SCORING: '/admin/scoring',
  ADMIN_SCORING_MATCH: '/admin/scoring/matches/:matchId',
  ADMIN_LEADERBOARDS: '/admin/leaderboards',
  ADMIN_LEADERBOARD_DETAIL: '/admin/leaderboards/contests/:contestId',

  // Admin panel (mounted via lazy boundary, RBAC-guarded)
  ADMIN_ROOT: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: '/admin/users/:userId',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_WALLETS: '/admin/wallets',
  ADMIN_WALLET_USER_DETAIL: '/admin/wallets/users/:userId',
  ADMIN_WALLET_ACTIONS: '/admin/wallets/actions',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_WITHDRAWALS: '/admin/withdrawals',
  ADMIN_KYC: '/admin/kyc',
  ADMIN_FINANCIAL_OPS: '/admin/financial',

  // Generic
  FORBIDDEN: '/forbidden',
  NOT_FOUND: '*',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
