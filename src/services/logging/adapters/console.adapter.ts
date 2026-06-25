import { logger } from '@utils/logger';

import type {
  BreadcrumbInput,
  CaptureContext,
  ErrorReporterAdapter,
  UserContext,
} from '../error-reporter.types';

/**
 * Default adapter — routes everything through the existing console
 * logger. Used in development and as a safety net when no SaaS
 * transport is configured.
 */
export const consoleAdapter: ErrorReporterAdapter = {
  name: 'console',

  init() {
    /* no-op */
  },

  setUser(user: UserContext | null) {
    if (user) logger.info('error-reporter: user set', { id: user.id });
    else logger.info('error-reporter: user cleared');
  },

  addBreadcrumb(crumb: BreadcrumbInput) {
    const level = crumb.level ?? 'info';
    const fn =
      level === 'error'
        ? logger.error.bind(logger)
        : level === 'warn'
          ? logger.warn.bind(logger)
          : level === 'debug'
            ? logger.debug.bind(logger)
            : logger.info.bind(logger);
    fn(`breadcrumb:${crumb.category} ${crumb.message}`, crumb.data ?? {});
  },

  captureException(error: unknown, ctx?: CaptureContext) {
    logger.error('captured exception', { error, ctx });
  },

  captureMessage(message: string, ctx?: CaptureContext) {
    logger.warn(`captured message: ${message}`, ctx ?? {});
  },
};
