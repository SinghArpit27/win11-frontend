import { cn } from '@utils/cn';

import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';

export type MatchHubTabId = 'contests' | 'my-contests' | 'teams' | 'gurus' | 'stats';

const TABS: ReadonlyArray<{ id: MatchHubTabId; label: string }> = [
  { id: 'contests', label: 'Contests' },
  { id: 'my-contests', label: 'My Contests' },
  { id: 'teams', label: 'Teams' },
  { id: 'gurus', label: 'Gurus' },
  { id: 'stats', label: 'Stats' },
];

interface MatchHubTabsProps {
  active: MatchHubTabId;
  onChange: (tab: MatchHubTabId) => void;
  className?: string;
}

/** Dream11 hub tabs — spaced labels, no dividers, red active underline. */
export const MatchHubTabs = ({
  active,
  onChange,
  className,
}: MatchHubTabsProps): JSX.Element => {
  const palette = useDream11Palette();

  return (
    <nav
      aria-label="Match sections"
      className={cn('border-b bg-white', className)}
      style={{ borderColor: palette.tabBorder }}
    >
      <div className="flex items-stretch gap-1 overflow-x-auto px-2.5">
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
                'relative shrink-0 px-1 py-2.5 text-[12px] font-bold leading-none whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d82d2c]/25',
              )}
              style={{ color: selected ? palette.red : palette.textPrimary }}
            >
              {tab.label}
              {selected ? (
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-full"
                  style={{ backgroundColor: palette.red }}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
