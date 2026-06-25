import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@constants/routes.constants';
import { Typography } from '@components/ui';
import { useAuth } from '@features/auth';
import { NotificationBell, NotificationCenter } from '@features/notifications';
import { cn } from '@utils/cn';

import { BrandMark } from './BrandMark';
import { WalletBalancePill } from './WalletBalancePill';

interface AppTopBarProps {
  className?: string;
}

/**
 * Global top navbar for the authenticated user app.
 *
 *  Visible on **all** breakpoints (was previously desktop-only). On
 *  mobile the layout collapses to:
 *
 *    [Brand]                  [Wallet] [Bell] [Avatar]
 *
 *  On desktop the search input + welcome label appear, but the right-
 *  side action group stays identical — three actions in the same
 *  order so muscle memory carries between form factors.
 *
 *  Primary navigation (Home / Matches / Explore) lives in
 *  `BottomTabBar` on mobile and `AppSidebar` on desktop — this bar
 *  hosts only personal-account affordances:
 *
 *    1. Wallet balance pill  →  /wallet
 *    2. Notification bell    →  notification surface (Phase 8)
 *    3. Profile avatar       →  /profile (theme + settings live there)
 *
 *  Heights and tokens come from the central theme registry
 *  (`--w11-layout-top-bar-height`, `--w11-layout-desktop-top-bar-height`).
 */
export const AppTopBar = ({ className }: AppTopBarProps): JSX.Element => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const displayName = user?.displayName ?? user?.email ?? user?.phone ?? 'Player';
  const initials = displayName.slice(0, 1).toUpperCase();

  const goToProfile = (): void => navigate(ROUTES.PROFILE);

  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex h-top-bar items-center gap-2 border-b border-border bg-bg-elevated/90 px-3 backdrop-blur-md',
        'sm:px-4 lg:h-desktop-top-bar lg:gap-4 lg:px-6',
        className,
      )}
    >
      {/* Brand (mobile shows the brand on the left where the sidebar takes over on desktop). */}
      <div className="flex shrink-0 items-center lg:hidden">
        <BrandMark size="sm" hideTagline />
      </div>

      {/* Search — desktop only. Mobile keeps the bar slim; per-screen search lives inside the page. */}
      <label className="relative hidden h-10 w-full max-w-md items-center lg:flex">
        <Search aria-hidden className="absolute left-3 h-4 w-4 text-text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players, contests, matches…"
          className={cn(
            'h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-text placeholder:text-text-muted',
            'transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          )}
          aria-label="Search"
        />
      </label>

      {/* Right-side action group — the only three personal-account affordances. */}
      <div className="ml-auto flex items-center gap-2">
        <WalletBalancePill className="hidden xs:inline-flex" />

        <NotificationBell onClick={() => setNotificationsOpen(true)} />
        <NotificationCenter open={notificationsOpen} onOpenChange={setNotificationsOpen} />

        <button
          type="button"
          onClick={goToProfile}
          className={cn(
            'flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-surface-hover',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          )}
          aria-label="Open profile"
        >
          <span
            aria-hidden
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-glow"
          >
            {initials}
          </span>
          <div className="hidden pr-2 text-right xl:block">
            <Typography variant="caption" tone="muted" className="block leading-tight">
              Welcome back
            </Typography>
            <Typography variant="body" className="block truncate font-semibold leading-tight">
              {displayName}
            </Typography>
          </div>
        </button>
      </div>
    </header>
  );
};
