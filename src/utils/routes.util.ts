import { generatePath } from 'react-router-dom';

import type { RoutePath } from '@constants/routes.constants';

/**
 * Type-safe route builder — replaces manual `.replace(':param', value)` chains.
 *
 * @example
 * buildRoute(ROUTES.CONTEST_DETAIL, { matchId, contestId })
 */
export const buildRoute = (
  template: RoutePath,
  params: Record<string, string | number>,
): string => generatePath(template, params);
