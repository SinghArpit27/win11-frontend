import { WifiOff } from 'lucide-react';

import { useAppSelector } from '@hooks/index';
import { selectIsOnline } from '@store/slices/app.slice';

/**
 * Slim banner that surfaces when the browser reports offline. Phase 1
 * is intentionally subtle — feature phases can swap this for a richer
 * toast once notifications are wired.
 */
export const OfflineBanner = (): JSX.Element | null => {
  const online = useAppSelector(selectIsOnline);
  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-warning/15 px-4 py-1.5 text-[12px] font-medium text-warning"
    >
      <WifiOff className="h-3.5 w-3.5" />
      <span>You are offline — some features may be unavailable.</span>
    </div>
  );
};
