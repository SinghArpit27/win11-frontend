import { memo } from 'react';

import { PlayerRole } from '@shared/enums';

import { cn } from '@utils/cn';

import type { FantasyRoleConstraint } from '../fantasy.types';

interface RoleTabsProps {
  active: PlayerRole | 'ALL';
  onChange: (next: PlayerRole | 'ALL') => void;
  constraints: FantasyRoleConstraint[];
  selectionByRole: Record<string, number>;
  totalSelected: number;
  totalRequired: number;
  showAllTab?: boolean;
  className?: string;
}

const ROLE_LABEL: Record<string, string> = {
  ALL: 'ALL',
  [PlayerRole.WICKET_KEEPER]: 'WK',
  [PlayerRole.BATSMAN]: 'BAT',
  [PlayerRole.ALL_ROUNDER]: 'AR',
  [PlayerRole.BOWLER]: 'BOWL',
  [PlayerRole.GOALKEEPER]: 'GK',
  [PlayerRole.DEFENDER]: 'DEF',
  [PlayerRole.MIDFIELDER]: 'MID',
  [PlayerRole.FORWARD]: 'FWD',
};

const RoleTabsComponent = ({
  active,
  onChange,
  constraints,
  selectionByRole,
  totalSelected,
  totalRequired,
  showAllTab = true,
  className,
}: RoleTabsProps): JSX.Element => {
  return (
    <div
      role="tablist"
      className={cn(
        'flex items-stretch justify-around gap-0 overflow-x-auto border-b border-border bg-surface',
        '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {showAllTab ? (
        <Tab
          label={`ALL ${totalSelected}/${totalRequired}`}
          active={active === 'ALL'}
          onClick={() => onChange('ALL')}
        />
      ) : null}
      {constraints.map((c) => {
        const count = selectionByRole[c.role] ?? 0;
        const label = ROLE_LABEL[c.role] ?? c.role;
        return (
          <Tab
            key={c.role}
            label={count > 0 ? `${label} (${count})` : label}
            active={active === c.role}
            onClick={() => onChange(c.role)}
          />
        );
      })}
    </div>
  );
};

const Tab = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}): JSX.Element => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={cn(
      'relative shrink-0 flex-1 px-2 py-2.5 text-center text-xs font-bold uppercase tracking-wider transition-colors sm:px-3',
      'focus:outline-none focus-visible:bg-surface-hover',
      active ? 'text-text' : 'text-text-muted hover:text-text',
    )}
  >
    {label}
    {active ? (
      <span
        aria-hidden
        className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
      />
    ) : null}
  </button>
);

export const RoleTabs = memo(RoleTabsComponent);
