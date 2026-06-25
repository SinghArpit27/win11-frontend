/**
 * Vendor-neutral contracts for error reporting. The platform layer
 * speaks ONLY these types; concrete adapters (Sentry / LogRocket /
 * console) implement the interface.
 *
 * This is what makes "swap Sentry for LogRocket" a single file change.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface UserContext {
  id: string;
  email?: string | null;
  username?: string | null;
  roles?: string[];
}

export interface BreadcrumbInput {
  category: 'navigation' | 'http' | 'auth' | 'socket' | 'ui' | 'custom';
  message: string;
  level?: LogLevel;
  data?: Record<string, unknown>;
}

export interface CaptureContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: LogLevel;
  fingerprint?: string[];
}

/**
 * Implemented by every transport adapter.
 *
 * Methods are intentionally side-effect-only — callers don't care
 * whether the transport is wired up.
 */
export interface ErrorReporterAdapter {
  readonly name: string;
  init(): Promise<void> | void;
  setUser(user: UserContext | null): void;
  addBreadcrumb(crumb: BreadcrumbInput): void;
  captureException(error: unknown, ctx?: CaptureContext): void;
  captureMessage(message: string, ctx?: CaptureContext): void;
  flush?(timeoutMs?: number): Promise<boolean>;
}
