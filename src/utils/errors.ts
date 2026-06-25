import type { ApiFailure } from '@types/api.types';

/**
 * Extracts a human-readable error message from any error-shaped value.
 * Used by RTK Query error transforms + error boundaries.
 */
export const extractErrorMessage = (err: unknown): string => {
  if (!err) return 'Unknown error';

  if (typeof err === 'string') return err;

  if (typeof err === 'object') {
    const e = err as Partial<ApiFailure> & {
      data?: ApiFailure;
      message?: string;
      status?: number | string;
    };

    if (e.data?.error?.message) return e.data.error.message;
    if (e.message) return e.message;
  }

  return 'Something went wrong';
};

export const isApiFailure = (v: unknown): v is ApiFailure => {
  return (
    !!v &&
    typeof v === 'object' &&
    'success' in v &&
    (v as { success: unknown }).success === false &&
    'error' in v
  );
};
