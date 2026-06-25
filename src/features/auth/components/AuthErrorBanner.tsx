import { AlertCircle } from 'lucide-react';

import { extractErrorMessage } from '@utils/errors';

interface AuthErrorBannerProps {
  error: unknown;
}

/**
 * Renders a friendly error message from any RTK Query / Fetch / Zod
 * error shape. Returns `null` if there is no error so callers can drop
 * it in unconditionally.
 */
export const AuthErrorBanner = ({ error }: AuthErrorBannerProps): JSX.Element | null => {
  if (!error) return null;
  const message = extractErrorMessage(error) ?? 'Something went wrong. Please try again.';
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
