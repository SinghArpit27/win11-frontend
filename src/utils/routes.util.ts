import { generatePath } from 'react-router-dom';

import { ROUTES, type RoutePath } from '@constants/routes.constants';

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

/** Create-team flow with optional contest context (join-after-save). */
export const buildCreateTeamRoute = (
  matchId: string,
  opts?: { contestId?: string; editTeamId?: string; cloneTeamId?: string },
): string => {
  const base = buildRoute(ROUTES.FANTASY_CREATE_TEAM, { matchId });
  const params = new URLSearchParams();
  if (opts?.contestId) params.set('contestId', opts.contestId);
  if (opts?.editTeamId) params.set('editTeamId', opts.editTeamId);
  if (opts?.cloneTeamId) params.set('cloneTeamId', opts.cloneTeamId);
  const query = params.toString();
  return query ? `${base}?${query}` : base;
};

/** After saving a team from a contest — open join confirmation on the match hub. */
export const buildContestConfirmJoinRoute = (
  matchId: string,
  contestId: string,
  teamId: string,
): string => {
  const base = buildRoute(ROUTES.MATCH_CONTESTS, { matchId });
  const params = new URLSearchParams({ confirmJoin: contestId, teamId });
  return `${base}?${params.toString()}`;
};
