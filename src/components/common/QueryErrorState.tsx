import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button, Card, Typography } from '@components/ui';
import { extractErrorMessage } from '@utils/errors';

interface QueryErrorStateProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Standard failed-query UI — use instead of infinite skeletons when
 * `isError` is true on an RTK Query hook.
 */
export const QueryErrorState = ({
  error,
  title = 'Something went wrong',
  onRetry,
  className,
}: QueryErrorStateProps): JSX.Element => (
  <Card padding="lg" className={className ?? 'border-dashed text-center'}>
    <AlertTriangle className="mx-auto h-8 w-8 text-warning" aria-hidden />
    <Typography variant="h3" className="mt-3 block">
      {title}
    </Typography>
    <Typography variant="caption" tone="muted" className="mt-1 block text-sm">
      {extractErrorMessage(error)}
    </Typography>
    {onRetry && (
      <Button
        variant="secondary"
        size="sm"
        className="mt-4"
        leftIcon={<RefreshCw className="h-4 w-4" />}
        onClick={onRetry}
      >
        Try again
      </Button>
    )}
  </Card>
);
