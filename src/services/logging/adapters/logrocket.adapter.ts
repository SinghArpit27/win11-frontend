import { logger } from '@utils/logger';

import type {
  BreadcrumbInput,
  CaptureContext,
  ErrorReporterAdapter,
  UserContext,
} from '../error-reporter.types';

/**
 * Stubbed LogRocket adapter. Same pattern as the Sentry one — drop in
 * `logrocket` + `logrocket-react`, fill the bodies, ship.
 */
export const logRocketAdapter: ErrorReporterAdapter = {
  name: 'logrocket',

  init() {
    logger.info('logrocket-adapter: init (stub — wire logrocket in Phase 10)');
  },

  setUser(_user: UserContext | null) {
    /* LogRocket.identify(user?.id, { ...user }); */
  },

  addBreadcrumb(_crumb: BreadcrumbInput) {
    /* LogRocket.track(crumb.message, crumb.data); */
  },

  captureException(error: unknown, ctx?: CaptureContext) {
    logger.error('logrocket-adapter: capture exception (stub)', { error, ctx });
  },

  captureMessage(message: string, ctx?: CaptureContext) {
    logger.warn('logrocket-adapter: capture message (stub)', { message, ctx });
  },
};
