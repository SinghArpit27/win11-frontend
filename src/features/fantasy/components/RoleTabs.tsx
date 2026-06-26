import { memo } from 'react';

import { PlayerRole } from '@shared/enums';

import { cn } from '@utils/cn';

import { CREATE_TEAM_COLORS, CREATE_TEAM_LAYOUT } from '../fantasy.create-team.tokens';
import type { FantasyRoleConstraint } from '../fantasy.types';

interface RoleTabsProps {
  active: PlayerRole | 'ALL';
  onChange: (next: PlayerRole | 'ALL') => void;
  constraints: FantasyRoleConstraint[];
  selectionByRole?: Record<string, number>;
  totalSelected?: number;
  totalRequired?: number;
  showAllTab?: boolean;
  className?: string;
}

const ROLE_LABEL: Record<string, string> = {
  ALL: 'All Players',
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
  selectionByRole = {},
  showAllTab = true,
  className,
}: RoleTabsProps): JSX.Element => (
  <div
    role="tablist"
    className={cn(
      'flex items-stretch justify-around overflow-x-auto border-b bg-[#ffffff]',
      '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
      className,
    )}
    style={{ borderColor: CREATE_TEAM_COLORS.divider }}
  >
    {showAllTab ? (
      <Tab label={ROLE_LABEL.ALL} active={active === 'ALL'} onClick={() => onChange('ALL')} />
    ) : null}
    {constraints.map((c) => {
      const base = ROLE_LABEL[c.role] ?? c.role;
      const picked = selectionByRole[c.role] ?? 0;
      const label = picked > 0 ? `${base} (${picked})` : base;
      return (
        <Tab
          key={c.role}
          label={label}
          active={active === c.role}
          onClick={() => onChange(c.role)}
        />
      );
    })}
  </div>
);

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
      'relative shrink-0 flex-1 px-2 text-center font-bold leading-none transition-colors sm:px-3',
      'focus:outline-none focus-visible:bg-[#fafafa]',
    )}
    style={{
      fontSize: CREATE_TEAM_LAYOUT.tabFontPx,
      paddingTop: 10,
      paddingBottom: 10,
      color: active ? CREATE_TEAM_COLORS.tabActive : CREATE_TEAM_COLORS.tabInactive,
    }}
  >
    {label}
    {active ? (
      <span
        aria-hidden
        className="absolute inset-x-2 -bottom-px h-[3px] rounded-full"
        style={{ backgroundColor: CREATE_TEAM_COLORS.tabActive }}
      />
    ) : null}
  </button>
);

export const RoleTabs = memo(RoleTabsComponent);
