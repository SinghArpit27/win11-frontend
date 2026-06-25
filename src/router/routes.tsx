import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { LoadingScreen } from '@components/common/LoadingScreen';
import { AppShell } from '@components/layout/AppShell';
import { ROUTES } from '@constants/routes.constants';
import { ForbiddenScreen } from '@features/placeholders/ForbiddenScreen';
import { NotFoundScreen } from '@features/placeholders/NotFoundScreen';
import {
  ExploreScreen,
} from '@features/placeholders/screens';
import { ProtectedRoute, PublicOnlyRoute, RoleGuard } from '@router/guards';
import { ADMIN_ROLES } from '@shared/enums';

/**
 * Single source of truth for the route tree.
 *
 * Layout (top → bottom):
 *  - `/splash`, `/onboarding` — first-launch flow.
 *  - `/auth/*`                — public-only auth screens.
 *  - `/admin/*`               — lazy-loaded admin panel, RBAC guarded.
 *  - `/`                       — authenticated user app (AppShell).
 *  - catch-all                — 404.
 */

// Auth + first-launch — lazy so the main user-app bundle stays lean.
const SplashScreen = lazy(() => import('@features/auth/screens/SplashScreen'));
const OnboardingScreen = lazy(() => import('@features/auth/screens/OnboardingScreen'));
const LoginScreen = lazy(() => import('@features/auth/screens/LoginScreen'));
const SignupScreen = lazy(() => import('@features/auth/screens/SignupScreen'));
const ForgotPasswordScreen = lazy(() => import('@features/auth/screens/ForgotPasswordScreen'));
const ResetPasswordScreen = lazy(() => import('@features/auth/screens/ResetPasswordScreen'));
const OtpVerifyScreen = lazy(() => import('@features/auth/screens/OtpVerifyScreen'));
const VerifyEmailScreen = lazy(() => import('@features/auth/screens/VerifyEmailScreen'));

// Lazy-loaded admin chunks. Each screen ships in its own chunk so user-app
// callers never download admin JS. The layout chunk is shared by all
// nested admin routes.
const AdminLayout = lazy(() => import('@features/admin/AdminLayout'));
const AdminDashboardScreen = lazy(
  () => import('@features/admin/screens/AdminDashboardScreen'),
);
const AdminUsersScreen = lazy(() => import('@features/admin/screens/AdminUsersScreen'));
const AdminUserDetailScreen = lazy(
  () => import('@features/admin/screens/AdminUserDetailScreen'),
);
const AdminRolesScreen = lazy(() => import('@features/admin/screens/AdminRolesScreen'));
const AdminAuditLogsScreen = lazy(
  () => import('@features/admin/screens/AdminAuditLogsScreen'),
);
const AdminWalletsScreen = lazy(
  () => import('@features/admin/screens/AdminWalletsScreen'),
);
const AdminWalletUserDetailScreen = lazy(
  () => import('@features/admin/screens/AdminWalletUserDetailScreen'),
);
const AdminWalletActionsScreen = lazy(
  () => import('@features/admin/screens/AdminWalletActionsScreen'),
);
const AdminPaymentsScreen = lazy(() => import('@features/admin/screens/AdminPaymentsScreen'));
const AdminWithdrawalsScreen = lazy(
  () => import('@features/admin/screens/AdminWithdrawalsScreen'),
);
const AdminKycScreen = lazy(() => import('@features/admin/screens/AdminKycScreen'));
const AdminFinancialOpsScreen = lazy(
  () => import('@features/admin/screens/AdminFinancialOpsScreen'),
);

// Wallet user screens. Lazy because they're large but most users will
// open them — code splitting still helps the splash-to-home journey.
const WalletDashboardScreen = lazy(
  () => import('@features/wallet/screens/WalletDashboardScreen'),
);
const WalletHistoryScreen = lazy(
  () => import('@features/wallet/screens/WalletHistoryScreen'),
);
const WalletFinancialScreen = lazy(
  () => import('@features/payments/screens/WalletFinancialScreen'),
);
const KycScreen = lazy(() => import('@features/payments/screens/KycScreen'));

// PHASE 4 — Sports / Home screens. Lazy so the auth bundle stays small.
const HomeScreen = lazy(() => import('@features/sports/screens/HomeScreen'));
const MatchesListScreen = lazy(
  () => import('@features/sports/screens/MatchesListScreen'),
);
const MatchDetailsScreen = lazy(
  () => import('@features/sports/screens/MatchDetailsScreen'),
);

// PHASE 5 — Fantasy flow. Each step is its own chunk so users who never
// open the create-team flow don't download the player picker JS.
const FantasyMyTeamsScreen = lazy(
  () => import('@features/fantasy/screens/MyTeamsScreen'),
);
const FantasyPlayerSelectionScreen = lazy(
  () => import('@features/fantasy/screens/PlayerSelectionScreen'),
);
const FantasyCaptainSelectionScreen = lazy(
  () => import('@features/fantasy/screens/CaptainSelectionScreen'),
);
const FantasyTeamPreviewScreen = lazy(
  () => import('@features/fantasy/screens/TeamPreviewScreen'),
);

// Account screens — profile, theme, settings hub.
const ProfileScreen = lazy(() => import('@features/account/screens/ProfileScreen'));

// PHASE 6 — Contests. Each chunk lazy-loaded so users who never browse
// contests don't download the join / detail bundles.
const ContestListScreen = lazy(
  () => import('@features/contests/screens/ContestListScreen'),
);
const ContestDetailScreen = lazy(
  () => import('@features/contests/screens/ContestDetailScreen'),
);
const JoinContestScreen = lazy(
  () => import('@features/contests/screens/JoinContestScreen'),
);
const MyContestsScreen = lazy(
  () => import('@features/contests/screens/MyContestsScreen'),
);
const AdminContestsScreen = lazy(
  () => import('@features/contests/screens/AdminContestsScreen'),
);

// PHASE 7 — Leaderboard + scoring. Lazy because most users land on
// matches/contests first; the leaderboard chunk only loads when they
// open a live contest or visit `/rankings`.
const ContestLeaderboardScreen = lazy(
  () => import('@features/leaderboard/screens/ContestLeaderboardScreen'),
);
const MyRankingsScreen = lazy(
  () => import('@features/leaderboard/screens/MyRankingsScreen'),
);
const AdminScoringScreen = lazy(
  () => import('@features/leaderboard/screens/AdminScoringScreen'),
);
const AdminLeaderboardScreen = lazy(
  () => import('@features/leaderboard/screens/AdminLeaderboardScreen'),
);

const withSuspense = (node: JSX.Element): JSX.Element => (
  <Suspense fallback={<LoadingScreen />}>{node}</Suspense>
);

export const routeTree: RouteObject[] = [
  { path: ROUTES.SPLASH, element: withSuspense(<SplashScreen />) },
  { path: ROUTES.ONBOARDING, element: withSuspense(<OnboardingScreen />) },

  // Public-only routes — bounce authed users away
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: ROUTES.LOGIN, element: withSuspense(<LoginScreen />) },
      { path: ROUTES.SIGNUP, element: withSuspense(<SignupScreen />) },
      { path: ROUTES.FORGOT_PASSWORD, element: withSuspense(<ForgotPasswordScreen />) },
      { path: ROUTES.RESET_PASSWORD, element: withSuspense(<ResetPasswordScreen />) },
      { path: ROUTES.OTP_VERIFY, element: withSuspense(<OtpVerifyScreen />) },
      { path: ROUTES.VERIFY_EMAIL, element: withSuspense(<VerifyEmailScreen />) },
    ],
  },

  // Admin panel — same React tree, separate code-split chunk
  {
    element: <RoleGuard allow={[...ADMIN_ROLES]} />,
    children: [
      {
        path: ROUTES.ADMIN_ROOT,
        element: withSuspense(<AdminLayout />),
        children: [
          { index: true, element: <Navigate to={ROUTES.ADMIN_DASHBOARD} replace /> },
          { path: ROUTES.ADMIN_DASHBOARD, element: withSuspense(<AdminDashboardScreen />) },
          { path: ROUTES.ADMIN_USERS, element: withSuspense(<AdminUsersScreen />) },
          {
            path: ROUTES.ADMIN_USER_DETAIL,
            element: withSuspense(<AdminUserDetailScreen />),
          },
          { path: ROUTES.ADMIN_ROLES, element: withSuspense(<AdminRolesScreen />) },
          { path: ROUTES.ADMIN_AUDIT_LOGS, element: withSuspense(<AdminAuditLogsScreen />) },
          { path: ROUTES.ADMIN_WALLETS, element: withSuspense(<AdminWalletsScreen />) },
          { path: ROUTES.ADMIN_WALLET_USER_DETAIL, element: withSuspense(<AdminWalletUserDetailScreen />) },
          { path: ROUTES.ADMIN_WALLET_ACTIONS, element: withSuspense(<AdminWalletActionsScreen />) },
          { path: ROUTES.ADMIN_PAYMENTS, element: withSuspense(<AdminPaymentsScreen />) },
          { path: ROUTES.ADMIN_WITHDRAWALS, element: withSuspense(<AdminWithdrawalsScreen />) },
          { path: ROUTES.ADMIN_KYC, element: withSuspense(<AdminKycScreen />) },
          { path: ROUTES.ADMIN_FINANCIAL_OPS, element: withSuspense(<AdminFinancialOpsScreen />) },
          { path: ROUTES.ADMIN_CONTESTS, element: withSuspense(<AdminContestsScreen />) },
          // PHASE 7 — Admin scoring + leaderboard monitors
          { path: ROUTES.ADMIN_SCORING, element: withSuspense(<AdminScoringScreen />) },
          {
            path: ROUTES.ADMIN_SCORING_MATCH,
            element: withSuspense(<AdminScoringScreen />),
          },
          {
            path: ROUTES.ADMIN_LEADERBOARDS,
            element: withSuspense(<AdminLeaderboardScreen />),
          },
          {
            path: ROUTES.ADMIN_LEADERBOARD_DETAIL,
            element: withSuspense(<AdminLeaderboardScreen />),
          },
        ],
      },
    ],
  },

  // Authenticated user app
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.ROOT,
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to={ROUTES.HOME} replace /> },
          { path: ROUTES.HOME, element: withSuspense(<HomeScreen />) },
          { path: ROUTES.EXPLORE, element: <ExploreScreen /> },
          { path: ROUTES.MATCHES, element: withSuspense(<MatchesListScreen />) },
          { path: ROUTES.MATCH_DETAIL, element: withSuspense(<MatchDetailsScreen />) },
          {
            path: ROUTES.FANTASY_MY_TEAMS,
            element: withSuspense(<FantasyMyTeamsScreen />),
          },
          {
            path: ROUTES.FANTASY_CREATE_TEAM,
            element: withSuspense(<FantasyPlayerSelectionScreen />),
          },
          {
            path: ROUTES.FANTASY_EDIT_TEAM,
            element: withSuspense(<FantasyPlayerSelectionScreen />),
          },
          {
            path: ROUTES.FANTASY_CLONE_TEAM,
            element: withSuspense(<FantasyPlayerSelectionScreen />),
          },
          {
            path: ROUTES.FANTASY_CAPTAINS,
            element: withSuspense(<FantasyCaptainSelectionScreen />),
          },
          {
            path: ROUTES.FANTASY_PREVIEW,
            element: withSuspense(<FantasyTeamPreviewScreen />),
          },
          {
            path: ROUTES.FANTASY_TEAM_DETAIL,
            element: withSuspense(<FantasyTeamPreviewScreen />),
          },
          { path: ROUTES.WALLET, element: withSuspense(<WalletDashboardScreen />) },
          { path: ROUTES.WALLET_HISTORY, element: withSuspense(<WalletHistoryScreen />) },
          { path: ROUTES.WALLET_FINANCIAL, element: withSuspense(<WalletFinancialScreen />) },
          { path: ROUTES.KYC, element: withSuspense(<KycScreen />) },
          { path: ROUTES.PROFILE, element: withSuspense(<ProfileScreen />) },
          // PHASE 6 — Contests
          { path: ROUTES.MY_CONTESTS, element: withSuspense(<MyContestsScreen />) },
          { path: ROUTES.MATCH_CONTESTS, element: withSuspense(<ContestListScreen />) },
          { path: ROUTES.CONTEST_DETAIL, element: withSuspense(<ContestDetailScreen />) },
          { path: ROUTES.CONTEST_JOIN, element: withSuspense(<JoinContestScreen />) },
          // PHASE 7 — Leaderboard + rankings
          {
            path: ROUTES.CONTEST_LEADERBOARD,
            element: withSuspense(<ContestLeaderboardScreen />),
          },
          { path: ROUTES.MY_RANKINGS, element: withSuspense(<MyRankingsScreen />) },
        ],
      },
    ],
  },

  { path: ROUTES.FORBIDDEN, element: <ForbiddenScreen /> },
  { path: ROUTES.NOT_FOUND, element: <NotFoundScreen /> },
];
