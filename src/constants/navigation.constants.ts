import { Compass, Home, Trophy, Users, type LucideIcon } from 'lucide-react';

import { ROUTES } from './routes.constants';

export interface UserNavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  /**
   * Should the route be matched exactly (`end` prop in React Router)?
   * Useful for the root tab so child routes don't all show as "active".
   */
  end?: boolean;
}

/**
 * Primary destinations exposed in the bottom tab bar (mobile / tablet)
 * and the desktop sidebar.
 *
 * Wallet, Profile and Notifications intentionally live in the
 * `AppTopBar` action group — they're personal-account affordances, not
 * primary navigation. This keeps the tab bar at the three highest-
 * intent destinations (Home → Matches → Explore) and matches the
 * 3-tab pattern used by leading fantasy apps.
 */
export const USER_NAV_ITEMS: ReadonlyArray<UserNavItem> = [
  { id: 'home', label: 'Home', to: ROUTES.HOME, icon: Home },
  { id: 'matches', label: 'Matches', to: ROUTES.MATCHES, icon: Trophy },
  { id: 'contests', label: 'My Matches', to: ROUTES.MY_CONTESTS, icon: Users },
  { id: 'explore', label: 'Explore', to: ROUTES.EXPLORE, icon: Compass },
];
