import { useMemo } from 'react';

import type {
  FantasyDraftSelection,
  FantasyMatchPlayer,
  FantasyRule,
  FantasyValidationResult,
} from '../fantasy.types';
import { validateFantasyTeamClient } from '../fantasy.validator';

/**
 * Memoised client-side validation hook.
 *
 *  Recomputes the full `FantasyValidationResult` on every selection
 *  change — but only when the inputs actually change (via `useMemo`).
 *  For an 11-player team with ~20 rule checks this runs in well under a
 *  millisecond, so we do not bother debouncing.
 *
 *  Returns `null` if either the rule or catalogue is not yet loaded.
 */

interface UseFantasyValidationArgs {
  rule: FantasyRule | null | undefined;
  selections: FantasyDraftSelection[];
  playerCatalogue: FantasyMatchPlayer[] | undefined;
  matchLocked?: boolean;
  existingTeamCount?: number;
  isEdit?: boolean;
}

export const useFantasyValidation = ({
  rule,
  selections,
  playerCatalogue,
  matchLocked,
  existingTeamCount,
  isEdit,
}: UseFantasyValidationArgs): FantasyValidationResult | null => {
  return useMemo<FantasyValidationResult | null>(() => {
    if (!rule || !playerCatalogue) return null;
    return validateFantasyTeamClient({
      rule,
      selections,
      playerCatalogue,
      matchLocked,
      existingTeamCount,
      isEdit,
    });
  }, [rule, selections, playerCatalogue, matchLocked, existingTeamCount, isEdit]);
};
