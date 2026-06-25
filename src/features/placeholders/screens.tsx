import { Compass } from 'lucide-react';

import { PlaceholderScreen } from './PlaceholderScreen';

/**
 * Placeholder screens for not-yet-implemented user-facing pages.
 *
 * Graduated screens:
 *   - `WalletScreen`  → Phase 3 → `@features/wallet/screens/WalletDashboardScreen`
 *   - `HomeScreen`    → Phase 4 → `@features/sports/screens/HomeScreen`
 *   - `ProfileScreen` → Phase 4 → `@features/account/screens/ProfileScreen`
 */
export const ExploreScreen = (): JSX.Element => (
  <PlaceholderScreen
    title="Explore"
    description="Discover sports, matches, leaderboards and trending contests."
    phase={4}
    Icon={Compass}
  />
);
