import { cn } from '@utils/cn';

import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';

import type { MyMatchesTabId } from '../my-matches.utils';

const TABS: ReadonlyArray<{ id: MyMatchesTabId; label: string }> = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'live', label: 'Live' },
  { id: 'completed', label: 'Completed' },
];

interface MyMatchesTabsProps {
  active: MyMatchesTabId;
  onChange: (tab: MyMatchesTabId) => void;
  className?: string;
}

/** Come-style segmented tabs — grey track, white active pill, red label. */
export const MyMatchesTabs = ({
  active,
  onChange,
  className,
}: MyMatchesTabsProps): JSX.Element => {
  const palette = useDream11Palette();

  return (
    <div
      role="tablist"
      aria-label="My matches"
      className={cn('rounded-[10px] p-1', className)}
      style={{ backgroundColor: '#eef1f5' }}
    >
      <div className="grid grid-cols-3 gap-1">
        {TABS.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.id)}
              className={cn(
                'rounded-[8px] py-2.5 text-center text-[13px] font-semibold transition-all',
                selected ? 'shadow-sm' : '',
              )}
              style={{
                backgroundColor: selected ? palette.card : 'transparent',
                color: selected ? palette.red : palette.textSecondary,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
