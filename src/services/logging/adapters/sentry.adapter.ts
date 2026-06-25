import { logger } from '@utils/logger';

import type {
  BreadcrumbInput,
  CaptureContext,
  ErrorReporterAdapter,
  UserContext,
} from '../error-reporter.types';

/**
 * Stubbed Sentry adapter.
 *
 * Drop the `@sentry/react` package in (Phase 10 / monitoring) and
 * replace the body of each method with the real SDK call:
 *
 *   import * as Sentry from '@sentry/react';
 *   Sentry.init({ dsn: env.sentryDsn, ... });
 *   Sentry.captureException(error, { extra: ctx?.extra });
 *
 * The platform interface stays unchanged → no consumers need to be
 * touched when the integration goes live.
 */
export const sentryAdapter: ErrorReporterAdapter = {
  name: 'sentry',

  init() {
    logger.info('sentry-adapter: init (stub — wire @sentry/react in Phase 10)');
  },

  setUser(_user: UserContext | null) {
    /* Sentry.setUser(user ?? null); */
  },

  addBreadcrumb(_crumb: BreadcrumbInput) {
    /* Sentry.addBreadcrumb({ category, message, level, data }); */
  },

  captureException(error: unknown, ctx?: CaptureContext) {
    logger.error('sentry-adapter: capture exception (stub)', { error, ctx });
  },

  captureMessage(message: string, ctx?: CaptureContext) {
    logger.warn('sentry-adapter: capture message (stub)', { message, ctx });
  },

  flush() {
    return Promise.resolve(true);
  },
};
