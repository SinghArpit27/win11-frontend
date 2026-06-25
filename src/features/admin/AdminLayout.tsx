import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AdminSidebar } from './components/AdminSidebar';
import { AdminTopBar } from './components/AdminTopBar';

/**
 * Top-level admin shell. Composes the sidebar + topbar + content area
 * and provides a responsive drawer state.
 *
 * This component is lazy-loaded by the router (`/admin` boundary) so
 * none of the admin code ships to user-app clients.
 */
const AdminLayout = (): JSX.Element => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-bg text-text">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
