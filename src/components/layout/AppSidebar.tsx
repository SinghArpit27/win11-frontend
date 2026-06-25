import { LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { Button, Typography } from '@components/ui';
import { USER_NAV_ITEMS } from '@constants/navigation.constants';
import { useAuth } from '@features/auth';
import { cn } from '@utils/cn';

import { BrandMark } from './BrandMark';

interface AppSidebarProps {
  className?: string;
}

/**
 * Desktop-only sidebar for the authenticated user app.
 *
 * Mirrors `AdminSidebar`'s visual language so navigation feels coherent
 * across user / admin surfaces, but renders the user-facing nav matrix.
 * On mobile the same destinations are surfaced via `BottomTabBar`, so
 * this component is hidden under `lg`.
 *
 * Width is driven by the theme layout token `--w11-layout-sidebar-width`
 * (default 264px) so a white-label tenant can widen the rail without
 * touching component code.
 */
export const AppSidebar = ({ className }: AppSidebarProps): JSX.Element => {
  const { user, logout, flags } = useAuth();
  const displayName = user?.displayName ?? user?.email ?? user?.phone ?? 'Player';

  return (
    <aside
      aria-label="Primary navigation"
      className={cn(
        'sticky top-0 hidden h-dvh w-sidebar shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex',
        className,
      )}
    >
      <header className="flex h-desktop-top-bar items-center border-b border-sidebar-border px-5">
        <BrandMark size="md" />
      </header>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {USER_NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.to}
                end={item.end ?? item.id === 'home'}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-muted text-primary'
                      : 'text-text-muted hover:bg-surface-hover hover:text-text',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <span
                        aria-hidden
                        className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-primary"
                      />
                    ) : null}
                    <item.icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="border-t border-sidebar-border p-4">
        <div className="mb-3 min-w-0">
          <Typography variant="caption" tone="muted">
            Signed in as
          </Typography>
          <Typography variant="body" className="truncate font-semibold">
            {displayName}
          </Typography>
        </div>
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          leftIcon={<LogOut className="h-4 w-4" />}
          onClick={() => logout()}
          loading={flags.logoutPending}
        >
          Sign out
        </Button>
      </footer>
    </aside>
  );
};
