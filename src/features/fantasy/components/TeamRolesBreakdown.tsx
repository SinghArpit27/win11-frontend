import { memo } from 'react';

import { PlayerRole } from '@shared/enums';

import { cn } from '@utils/cn';

import type { FantasyRoleConstraint } from '../fantasy.types';

interface TeamRolesBreakdownProps {
  constraints: FantasyRoleConstraint[];
  countByRole: Record<string, number>;
  className?: string;
}

const ROLE_LABEL: Record<string, string> = {
  [PlayerRole.WICKET_KEEPER]: 'WK',
  [PlayerRole.BATSMAN]: 'BAT',
  [PlayerRole.ALL_ROUNDER]: 'AR',
  [PlayerRole.BOWLER]: 'BWL',
  [PlayerRole.GOALKEEPER]: 'GK',
  [PlayerRole.DEFENDER]: 'DEF',
  [PlayerRole.MIDFIELDER]: 'MID',
  [PlayerRole.FORWARD]: 'FWD',
};

/**
 * Read-only role breakdown chip set. Each chip shows the role + count
 * and turns green when the count is within bounds. Used both in the
 * sticky bottom bar and in the team preview screen.
 */
const TeamRolesBreakdownComponent = ({
  constraints,
  countByRole,
  className,
}: TeamRolesBreakdownProps): JSX.Element => {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {constraints.map((c) => {
        const count = countByRole[c.role] ?? 0;
        const inBounds = count >= c.min && count <= c.max;
        return (
          <span
            key={c.role}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
              inBounds && count > 0
                ? 'bg-success/15 text-success'
                : count > c.max
                  ? 'bg-danger/15 text-danger'
                  : 'bg-surface-elevated text-text-muted',
            )}
          >
            <span className="uppercase tracking-wider">{ROLE_LABEL[c.role] ?? c.role}</span>
            <span>
              {count}
              <span className="opacity-60">
                /{c.min === c.max ? c.max : `${c.min}-${c.max}`}
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const TeamRolesBreakdown = memo(TeamRolesBreakdownComponent);
