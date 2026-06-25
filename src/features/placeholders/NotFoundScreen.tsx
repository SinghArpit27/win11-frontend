import { Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { EmptyState } from '@components/common';
import { Button } from '@components/ui/button';
import { ROUTES } from '@constants/routes.constants';

export const NotFoundScreen = (): JSX.Element => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-bg">
      <EmptyState
        icon={<Compass className="h-10 w-10" />}
        title="Page not found"
        description="The page you’re looking for doesn’t exist or has been moved."
        action={
          <Button variant="primary" onClick={() => navigate(ROUTES.HOME)}>
            Back to Home
          </Button>
        }
      />
    </div>
  );
};
