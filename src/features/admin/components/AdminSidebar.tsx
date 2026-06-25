import { LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { BrandMark } from '@components/layout';
import { Button, Typography } from '@components/ui';
import { useAuth } from '@features/auth';
import { cn } from '@utils/cn';

import { ADMIN_NAV_ITEMS } from '../admin.navigation';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Side navigation for the admin panel.
 *
 *  - Mobile : rendered as an off-canvas drawer (controlled by `open`).
 *  - Desktop: rendered as a static rail, width driven by the theme
 *             token `--w11-layout-sidebar-width`.
 *
 * Items are filtered by the caller's roles client-side; the backend
 * still enforces RBAC on every API call.
 */
export const AdminSidebar = ({ open, onClose }: AdminSidebarProps): JSX.Element => {
  const { user, roles, logout, flags } = useAuth();
  const visibleItems = ADMIN_NAV_ITEMS.filter((item) =>
    item.allow.some((r) => roles.includes(r)),
  );
  const displayName = user?.displayName ?? user?.email ?? user?.phone ?? 'Admin';

  return (
    <>
      {/* Mobile backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        aria-label="Admin navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-sidebar flex-col border-r border-sidebar-border bg-sidebar shadow-lg transition-transform',
          'lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:translate-x-0 lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <header className="flex h-desktop-top-bar items-center justify-between border-b border-sidebar-border px-5">
          <div className="flex flex-col gap-0.5">
            <Typography variant="overline" tone="muted">
              Control center
            </Typography>
            <BrandMark hideTagline size="sm" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {visibleItems.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  end={item.path.endsWith('dashboard')}
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
                      {item.label}
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
    </>
  );
};
