import { Menu } from 'lucide-react';

import { ThemeToggle } from '@components/layout';
import { Typography } from '@components/ui';
import { APP_NAME } from '@constants/app.constants';
import { useAuth } from '@features/auth';
import { resolveUserHandle } from '@features/auth/auth.utils';

interface AdminTopBarProps {
  onOpenSidebar: () => void;
}

/**
 * Sticky top bar inside the admin layout.
 *
 * Houses the mobile drawer trigger, a small caller summary, and a theme
 * toggle. Wider feature toolbars (filters, bulk actions) live inside
 * each individual admin screen.
 *
 * Height matches `--w11-layout-desktop-top-bar-height` so the bar lines
 * up visually with the sidebar header.
 */
export const AdminTopBar = ({ onOpenSidebar }: AdminTopBarProps): JSX.Element => {
  const { user, roles } = useAuth();
  const handle = resolveUserHandle(user);
  return (
    <header className="sticky top-0 z-20 flex h-desktop-top-bar items-center gap-3 border-b border-border bg-bg-elevated/90 px-4 backdrop-blur-md lg:px-6">
      <button
        type="button"
        className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-hover hover:text-text lg:hidden"
        onClick={onOpenSidebar}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex flex-1 items-center justify-between gap-4">
        <Typography variant="h3" className="text-base font-bold tracking-tight sm:text-lg">
          {APP_NAME} Admin
        </Typography>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <Typography variant="caption" tone="muted">
              {roles.join(' · ')}
            </Typography>
            <Typography variant="body" className="text-sm font-semibold">
              {handle}
            </Typography>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
