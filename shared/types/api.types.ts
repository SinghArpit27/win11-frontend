/**
 * Canonical API envelope shared by backend + mobile.
 * - Backend  : `backend/src/common/types/api-response.types.ts` re-exports these.
 * - Mobile   : `mobile-app/src/types/api.types.ts` re-exports these.
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
  requestId?: string;
  timestamp: string;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
