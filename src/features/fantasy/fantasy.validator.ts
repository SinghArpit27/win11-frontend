import {
  FantasyValidationIssueCode,
  FantasyValidationSeverity,
  PlayerRole,
} from '@shared/enums';

import type {
  FantasyMatchPlayer,
  FantasyRule,
  FantasyValidationIssue,
  FantasyValidationResult,
} from './fantasy.types';

/**
 * Client-side mirror of the backend fantasy validator.
 *
 * Why duplicate the logic? Live UI feedback — the user picks a player
 * and the credit bar / role chips update instantly. The backend remains
 * the authoritative source (any save still flows through the backend
 * validator); this client copy is *advisory*. We keep the file < 200
 * LOC and pure so it stays trivial to diff against the server logic.
 *
 * The exported signature is identical to the backend's so server-side
 * preview responses can be substituted at any time.
 */

export interface FantasyValidatorSelection {
  playerId: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

const error = (
  code: FantasyValidationIssueCode,
  message: string,
  context?: FantasyValidationIssue['context'],
): FantasyValidationIssue => ({
  code,
  severity: FantasyValidationSeverity.ERROR,
  message,
  context,
});

const warn = (
  code: FantasyValidationIssueCode,
  message: string,
  context?: FantasyValidationIssue['context'],
): FantasyValidationIssue => ({
  code,
  severity: FantasyValidationSeverity.WARNING,
  message,
  context,
});

const inc = (obj: Record<string, number>, key: string): void => {
  obj[key] = (obj[key] ?? 0) + 1;
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

export interface ValidateFantasyTeamClientArgs {
  rule: FantasyRule;
  selections: FantasyValidatorSelection[];
  playerCatalogue: FantasyMatchPlayer[];
  matchLocked?: boolean;
  existingTeamCount?: number;
  isEdit?: boolean;
}

export const validateFantasyTeamClient = ({
  rule,
  selections,
  playerCatalogue,
  matchLocked,
  existingTeamCount,
  isEdit,
}: ValidateFantasyTeamClientArgs): FantasyValidationResult => {
  const issues: FantasyValidationIssue[] = [];
  const catalog = new Map(playerCatalogue.map((p) => [p.id, p]));

  const roleBreakdown: Record<string, number> = {};
  const teamBreakdown: Record<string, number> = {};
  const seen = new Set<string>();
  let creditsUsed = 0;
  let captainCount = 0;
  let viceCaptainCount = 0;
  let captainId: string | null = null;
  let viceCaptainId: string | null = null;

  for (const sel of selections) {
    if (seen.has(sel.playerId)) {
      issues.push(
        error(FantasyValidationIssueCode.DUPLICATE_PLAYER, 'Duplicate player selected', {
          playerId: sel.playerId,
        }),
      );
      continue;
    }
    seen.add(sel.playerId);

    const player = catalog.get(sel.playerId);
    if (!player) {
      issues.push(
        error(FantasyValidationIssueCode.PLAYER_NOT_FOUND, 'Selected player not found', {
          playerId: sel.playerId,
        }),
      );
      continue;
    }

    const role = (player.role ?? PlayerRole.UNKNOWN) as PlayerRole;
    const teamId = player.team?.id ?? '';
    inc(roleBreakdown, role);
    if (teamId) inc(teamBreakdown, teamId);
    creditsUsed += player.credits;

    if (sel.isCaptain) {
      captainCount += 1;
      captainId = player.id;
    }
    if (sel.isViceCaptain) {
      viceCaptainCount += 1;
      viceCaptainId = player.id;
    }
  }

  const playersSelected = seen.size;
  const creditsRemaining = rule.creditBudget - creditsUsed;

  if (matchLocked) {
    issues.push(
      error(
        FantasyValidationIssueCode.MATCH_LOCKED,
        'Match has already started — teams can no longer be edited',
      ),
    );
  }

  if (
    typeof existingTeamCount === 'number' &&
    !isEdit &&
    existingTeamCount >= rule.maxTeamsPerUserPerMatch
  ) {
    issues.push(
      error(
        FantasyValidationIssueCode.MAX_TEAMS_PER_USER_REACHED,
        `You already have ${rule.maxTeamsPerUserPerMatch} teams for this match`,
        { current: existingTeamCount, max: rule.maxTeamsPerUserPerMatch },
      ),
    );
  } else if (
    typeof existingTeamCount === 'number' &&
    !isEdit &&
    existingTeamCount + 1 >= rule.warnAtTeamsPerUserPerMatch
  ) {
    issues.push(
      warn(
        FantasyValidationIssueCode.MAX_TEAMS_PER_USER_REACHED,
        `You are nearing the maximum number of teams for this match`,
        { current: existingTeamCount, max: rule.maxTeamsPerUserPerMatch },
      ),
    );
  }

  if (playersSelected !== rule.teamSize) {
    issues.push(
      error(
        FantasyValidationIssueCode.TEAM_SIZE_MISMATCH,
        `Team must have exactly ${rule.teamSize} players (current: ${playersSelected})`,
        { expected: rule.teamSize, actual: playersSelected },
      ),
    );
  }

  if (creditsUsed > rule.creditBudget) {
    issues.push(
      error(
        FantasyValidationIssueCode.CREDITS_EXCEEDED,
        `Credits exceeded by ${(creditsUsed - rule.creditBudget).toFixed(1)}`,
        { used: creditsUsed, budget: rule.creditBudget },
      ),
    );
  }

  for (const constraint of rule.roleConstraints) {
    const count = roleBreakdown[constraint.role] ?? 0;
    if (count < constraint.min) {
      issues.push(
        error(
          FantasyValidationIssueCode.ROLE_MIN_NOT_MET,
          `Need at least ${constraint.min} ${constraint.role.toLowerCase()}(s) (have ${count})`,
          { role: constraint.role, min: constraint.min, actual: count },
        ),
      );
    }
    if (count > constraint.max) {
      issues.push(
        error(
          FantasyValidationIssueCode.ROLE_MAX_EXCEEDED,
          `Maximum ${constraint.max} ${constraint.role.toLowerCase()}(s) allowed (have ${count})`,
          { role: constraint.role, max: constraint.max, actual: count },
        ),
      );
    }
  }

  for (const [teamId, count] of Object.entries(teamBreakdown)) {
    if (count > rule.maxFromSingleTeam) {
      issues.push(
        error(
          FantasyValidationIssueCode.TEAM_PLAYER_LIMIT_EXCEEDED,
          `Maximum ${rule.maxFromSingleTeam} players allowed from a single team (you have ${count})`,
          { teamId, max: rule.maxFromSingleTeam, actual: count },
        ),
      );
    }
  }
  if (playersSelected === rule.teamSize) {
    for (const [teamId, count] of Object.entries(teamBreakdown)) {
      if (count < rule.minFromSingleTeam) {
        issues.push(
          error(
            FantasyValidationIssueCode.TEAM_PLAYER_LIMIT_NOT_MET,
            `Need at least ${rule.minFromSingleTeam} players from each team`,
            { teamId, min: rule.minFromSingleTeam, actual: count },
          ),
        );
      }
    }
  }

  if (captainCount === 0) {
    issues.push(error(FantasyValidationIssueCode.CAPTAIN_NOT_SELECTED, 'Please select a captain'));
  } else if (captainCount > 1) {
    issues.push(
      error(FantasyValidationIssueCode.CAPTAIN_NOT_SELECTED, 'A team can have only one captain'),
    );
  }
  if (viceCaptainCount === 0) {
    issues.push(
      error(FantasyValidationIssueCode.VICE_CAPTAIN_NOT_SELECTED, 'Please select a vice-captain'),
    );
  } else if (viceCaptainCount > 1) {
    issues.push(
      error(
        FantasyValidationIssueCode.VICE_CAPTAIN_NOT_SELECTED,
        'A team can have only one vice-captain',
      ),
    );
  }
  if (captainId && viceCaptainId && captainId === viceCaptainId) {
    issues.push(
      error(
        FantasyValidationIssueCode.CAPTAIN_VICE_CAPTAIN_SAME,
        'Captain and vice-captain must be different players',
      ),
    );
  }

  const hasError = issues.some((i) => i.severity === FantasyValidationSeverity.ERROR);

  return {
    isValid: !hasError,
    issues,
    summary: {
      playersSelected,
      creditsUsed: round2(creditsUsed),
      creditsRemaining: round2(creditsRemaining),
      roleBreakdown,
      teamBreakdown,
      hasCaptain: captainCount === 1,
      hasViceCaptain: viceCaptainCount === 1,
    },
  };
};
