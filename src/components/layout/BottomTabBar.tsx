import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

import { USER_NAV_ITEMS } from '@constants/navigation.constants';
import { cn } from '@utils/cn';

/**
 * Sticky bottom tab bar — mobile + tablet only.
 *
 *  - Hidden on `lg+` where `AppSidebar` takes over.
 *  - Full-width across the available content area (NOT clamped to 480px).
 *  - Active tab gets a top accent indicator with a spring layout
 *    transition for tactile feedback.
 *  - Touch targets meet the 44×44 minimum for mobile a11y.
 *
 * Tab destinations come from the centralised `USER_NAV_ITEMS` registry,
 * so adding a new tab updates both this surface and the desktop sidebar
 * in lockstep.
 */
export const BottomTabBar = (): JSX.Element => (
  <nav
    aria-label="Primary"
    className={cn(
      'sticky bottom-0 z-30 w-full safe-pb lg:hidden',
      'border-t border-border bg-bg-elevated/90 backdrop-blur-md',
    )}
  >
    <ul className="mx-auto flex h-tab-bar max-w-2xl items-stretch justify-around px-2">
      {USER_NAV_ITEMS.map(({ id, label, to, icon: Icon, end }) => (
        <li key={id} className="flex flex-1">
          <NavLink
            to={to}
            end={end ?? id === 'home'}
            className={({ isActive }) =>
              cn(
                'group relative flex flex-1 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 transition-colors',
                'min-h-[44px] min-w-[44px] touch-manipulation',
                isActive ? 'text-tab-active' : 'text-tab-inactive hover:text-text',
              )
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <motion.span
                    layoutId="tab-bar-active"
                    className="absolute inset-x-3 top-0 h-[2px] rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <Icon className="h-[22px] w-[22px]" />
                <span className="text-[10px] font-semibold leading-none">{label}</span>
              </>
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);
