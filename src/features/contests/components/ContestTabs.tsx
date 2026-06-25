import { Flame, Lock, ShieldCheck, Sparkles, Swords, Trophy } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

import { ContestType } from '@shared/enums';

export type ContestTabId = 'all' | ContestType;

interface ContestTabsProps {
  active: ContestTabId;
  onChange: (id: ContestTabId) => void;
  /** Optional counts shown as small superscript numbers. */
  counts?: Partial<Record<ContestTabId, number>>;
  className?: string;
}

const TABS: ReadonlyArray<{
  id: ContestTabId;
  label: string;
  Icon: typeof Flame;
}> = [
  { id: 'all', label: 'All', Icon: Sparkles },
  { id: ContestType.MEGA, label: 'Mega', Icon: Flame },
  { id: ContestType.HEAD_TO_HEAD, label: 'H2H', Icon: Swords },
  { id: ContestType.GUARANTEED, label: 'Guaranteed', Icon: ShieldCheck },
  { id: ContestType.PRACTICE, label: 'Practice', Icon: Trophy },
  { id: ContestType.PRIVATE, label: 'Private', Icon: Lock },
];

/**
 * Horizontally scrollable contest-type tabs. Sticky friendly — the parent
 * applies positioning. We keep this pure / memoised.
 */
const ContestTabsComponent = ({
  active,
  onChange,
  counts,
  className,
}: ContestTabsProps): JSX.Element => (
  <div
    role="tablist"
    aria-label="Contest filters"
    className={cn(
      'no-scrollbar flex w-full items-center gap-2 overflow-x-auto rounded-xl bg-surface p-1 shadow-sm',
      className,
    )}
  >
    {TABS.map(({ id, label, Icon }) => {
      const isActive = active === id;
      const count = counts?.[id];
      return (
        <button
          key={id}
          role="tab"
          type="button"
          aria-selected={isActive}
          onClick={() => onChange(id)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm',
            isActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-text-muted hover:text-text',
          )}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          <span>{label}</span>
          {typeof count === 'number' && count > 0 && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                isActive
                  ? 'bg-primary-foreground/15 text-primary-foreground'
                  : 'bg-surface-elevated text-text-muted',
              )}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

export const ContestTabs = memo(ContestTabsComponent);
ContestTabs.displayName = 'ContestTabs';
