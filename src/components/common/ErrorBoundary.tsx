import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@components/ui/button';
import { Typography } from '@components/ui/typography';
import { errorReporter } from '@services/logging';
import { logger } from '@utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (props: { error: Error; reset: () => void }) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Top-level error boundary. Mount this once at the app shell so a
 * single thrown render error doesn't take the entire experience down.
 * Feature-level boundaries can be nested inside as needed.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('ErrorBoundary caught', { message: error.message, stack: error.stack, info });
    errorReporter.captureException(error, {
      tags: { boundary: 'react' },
      extra: { componentStack: info.componentStack ?? undefined },
    });
  }

  reset = (): void => this.setState({ error: null });

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });

    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-3 bg-bg px-6 text-center">
        <Typography variant="h2">Something went wrong</Typography>
        <Typography variant="body" tone="muted">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </Typography>
        <Button variant="primary" onClick={this.reset}>
          Try again
        </Button>
      </div>
    );
  }
}
