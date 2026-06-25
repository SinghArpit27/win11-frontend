import { Outlet, useLocation } from 'react-router-dom';

import { cn } from '@utils/cn';

import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';
import { BottomTabBar } from './BottomTabBar';

interface AppShellProps {
  className?: string;
}

/**
 * Immersive route segments — routes whose UI owns its own top bar /
 * bottom action bar (e.g. the create-team flow). For these we hide both
 * the global `AppTopBar` and the `BottomTabBar` so the screen can render
 * full-bleed against its own header gradient.
 *
 *  Matching strategy: we split the pathname on `/` and check whether
 *  any segment after `/matches/:matchId/` is one of the immersive
 *  sub-flows. This is more robust than a regex because it tolerates
 *  trailing slashes, query strings, and nested sub-paths like
 *  `/matches/:matchId/teams/:teamId/edit` without each case needing its
 *  own regex.
 */
const IMMERSIVE_MATCH_SEGMENTS = new Set<string>([
  'my-teams',
  'create-team',
  'captains',
  'preview',
  'teams', // covers /teams/:teamId, /teams/:teamId/edit, /teams/:teamId/clone
]);

const isImmersive = (pathname: string): boolean => {
  // Normalise — strip trailing slash, lower-case, drop query/hash if any
  // (useLocation already strips them but being defensive is cheap).
  const clean = pathname.split('?')[0]!.split('#')[0]!.replace(/\/+$/, '').toLowerCase();
  const segments = clean.split('/').filter(Boolean);
  // Pattern: [matches, :matchId, <immersiveSegment>, ...]
  if (segments[0] !== 'matches' || segments.length < 3) return false;
  return IMMERSIVE_MATCH_SEGMENTS.has(segments[2] ?? '');
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
  const immersive = isImmersive(location.pathname);

  return (
    <div className={cn('flex min-h-dvh w-full bg-bg text-text', className)}>
      {/* Desktop sidebar — hidden under lg by AppSidebar itself. */}
      {!immersive ? <AppSidebar /> : null}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top navbar — suppressed for immersive flows so the screen owns its own header. */}
        {!immersive ? <AppTopBar /> : null}

        <main className="flex flex-1 flex-col overflow-x-hidden">
          <Outlet />
        </main>

        {/* Mobile + tablet bottom-tab nav — also suppressed for immersive flows. */}
        {!immersive ? <BottomTabBar /> : null}
      </div>
    </div>
  );
};
