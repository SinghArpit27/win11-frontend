import type { ReactNode } from 'react';

import { Typography } from '@components/ui/typography';
import { cn } from '@utils/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps): JSX.Element => (
  <div
    className={cn(
      'flex w-full flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center',
      className,
    )}
  >
    {icon ? <div className="text-text-muted">{icon}</div> : null}
    <Typography variant="h3">{title}</Typography>
    {description ? (
      <Typography variant="body" tone="muted">
        {description}
      </Typography>
    ) : null}
    {action ? <div className="pt-2">{action}</div> : null}
  </div>
);
