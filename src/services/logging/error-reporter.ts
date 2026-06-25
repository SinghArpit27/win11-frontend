import { logger } from '@utils/logger';

import { consoleAdapter } from './adapters/console.adapter';
import type {
  BreadcrumbInput,
  CaptureContext,
  ErrorReporterAdapter,
  UserContext,
} from './error-reporter.types';

/**
 * Singleton facade that components / hooks call.
 *
 * - One adapter is active at a time (`activeAdapter`).
 * - Use `errorReporter.useAdapter(...)` from `main.tsx` to wire Sentry
 *   or LogRocket once their packages are installed.
 * - Every call is wrapped in try/catch so a misbehaving transport
 *   never crashes the host app.
 */
class ErrorReporter implements ErrorReporterAdapter {
  readonly name = 'facade';
  private active: ErrorReporterAdapter = consoleAdapter;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      await Promise.resolve(this.active.init());
      this.initialized = true;
    } catch (err) {
      logger.warn('error-reporter init failed; falling back to console', err);
      this.active = consoleAdapter;
    }
  }

  useAdapter(adapter: ErrorReporterAdapter): void {
    this.active = adapter;
    this.initialized = false;
    void this.init();
  }

  setUser(user: UserContext | null): void {
    try {
      this.active.setUser(user);
    } catch (err) {
      logger.warn('error-reporter setUser failed', err);
    }
  }

  addBreadcrumb(crumb: BreadcrumbInput): void {
    try {
      this.active.addBreadcrumb(crumb);
    } catch (err) {
      logger.warn('error-reporter addBreadcrumb failed', err);
    }
  }

  captureException(error: unknown, ctx?: CaptureContext): void {
    try {
      this.active.captureException(error, ctx);
    } catch (err) {
      logger.warn('error-reporter captureException failed', err);
    }
  }

  captureMessage(message: string, ctx?: CaptureContext): void {
    try {
      this.active.captureMessage(message, ctx);
    } catch (err) {
      logger.warn('error-reporter captureMessage failed', err);
    }
  }

  async flush(timeoutMs?: number): Promise<boolean> {
    try {
      return (await this.active.flush?.(timeoutMs)) ?? true;
    } catch {
      return false;
    }
  }
}

export const errorReporter = new ErrorReporter();

/**
 * Wires a global runtime-error catcher + unhandled-promise listener so
 * any error escaping a React boundary is still reported.
 */
export const installGlobalErrorHandlers = (): void => {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    errorReporter.captureException(event.error ?? event.message, {
      tags: { source: 'window.error' },
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorReporter.captureException(event.reason, {
      tags: { source: 'unhandledrejection' },
    });
  });
};
