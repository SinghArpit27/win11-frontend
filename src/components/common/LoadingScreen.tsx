import { Spinner } from '@components/ui/spinner';
import { cn } from '@utils/cn';

interface LoadingScreenProps {
  label?: string;
  fullscreen?: boolean;
  className?: string;
}

/**
 * Full-bleed loading state. Used for route-level Suspense fallbacks and
 * the initial boot phase before the theme has been applied.
 */
export const LoadingScreen = ({
  label = 'Loading…',
  fullscreen = true,
  className,
}: LoadingScreenProps): JSX.Element => (
  <div
    role="status"
    aria-live="polite"
    className={cn(
      'flex flex-col items-center justify-center gap-3 bg-bg text-text-muted',
      fullscreen ? 'min-h-dvh w-full' : 'w-full py-10',
      className,
    )}
  >
    <Spinner size="lg" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);
