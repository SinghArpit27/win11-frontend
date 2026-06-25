import { ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';

export const ForbiddenScreen = (): JSX.Element => (
  <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-text">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
      <ShieldOff className="h-7 w-7" />
    </span>
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="text-sm text-text-muted">You don't have permission to view this page.</p>
    </div>
    <Button asChild>
      <Link to={ROUTES.HOME}>Back to home</Link>
    </Button>
  </div>
);
