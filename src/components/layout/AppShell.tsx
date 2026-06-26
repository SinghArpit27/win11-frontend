import { Outlet, useLocation } from 'react-router-dom';

import { cn } from '@utils/cn';

import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { BottomTabBar } from './BottomTabBar';

interface AppShellProps {
  className?: string;
}

/**
 * Match sub-flows that hide the global bottom tab bar (create-team, contest
 * hub, etc.) because they render their own sticky footer / FAB.
 *
 * The global `AppTopBar` stays visible on these routes — same as Home —
 * so wallet, notifications, and profile remain one tap away.
 */
const SUPPRESS_BOTTOM_TAB_SEGMENTS = new Set<string>([
  'contests',
  'my-teams',
  'create-team',
  'captains',
  'preview',
  'teams', // covers /teams/:teamId, /teams/:teamId/edit, /teams/:teamId/clone
]);

const suppressBottomTabBar = (pathname: string): boolean => {
  const clean = pathname.split('?')[0]!.split('#')[0]!.replace(/\/+$/, '').toLowerCase();
  const segments = clean.split('/').filter(Boolean);
  if (segments[0] !== 'matches' || segments.length < 3) return false;
  return SUPPRESS_BOTTOM_TAB_SEGMENTS.has(segments[2] ?? '');
};

/**
 * Top-level frame for every authenticated user route.
 *
 * Three responsive behaviours, all driven by the same JSX and theme tokens:
 *
 *  - **Mobile** (< md): full-bleed single-column content. The top bar
 *    hosts personal-account affordances (wallet pill, notification bell,
 *    profile avatar) and a sticky bottom-tab bar carries the three
 *    primary destinations (Home → Matches → Explore).
 *  - **Tablet** (md ≤ w < lg): same as mobile with roomier padding.
 *  - **Desktop** (≥ lg): persistent left sidebar (primary nav) + sticky
 *    top navbar (search + the same 3 personal-account actions) +
 *    full-width content. **No centered phone frame.**
 *
 * Match sub-flows (create-team, contest hub, …) suppress only the bottom
 * tab bar — `AppTopBar` stays visible so wallet/profile match Home.
 *
 * Layout token contract:
 *  - sidebar width      → `--w11-layout-sidebar-width`
 *  - desktop top-bar    → `--w11-layout-desktop-top-bar-height`
 *  - mobile top-bar     → `--w11-layout-top-bar-height`
 *  - bottom tab bar     → `--w11-layout-tab-bar-height`
 *
 * Every value tracks the theme registry so a white-label tenant can
 * widen the sidebar or shorten the top bar from env without code changes.
 */
export const AppShell = ({ className }: AppShellProps): JSX.Element => {
  const location = useLocation();
  const hideBottomTab = suppressBottomTabBar(location.pathname);

  return (
    <div className={cn('flex min-h-dvh w-full bg-bg text-text', className)}>
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar />

        <main className="flex flex-1 flex-col overflow-x-hidden">
          <Outlet />
        </main>

        {!hideBottomTab ? <BottomTabBar /> : null}
      </div>
    </div>
  );
};
