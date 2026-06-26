import { cn } from '@utils/cn';

import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';

export type MatchHubTabId = 'contests' | 'my-contests' | 'teams' | 'gurus' | 'stats';

interface MatchHubTabsProps {
  active: MatchHubTabId;
  onChange: (tab: MatchHubTabId) => void;
  myMatchesCount?: number;
  teamsCount?: number;
  className?: string;
}

const formatCountLabel = (base: string, count?: number): string =>
  count && count > 0 ? `${base} (${count})` : base;

/** Come / Dream11 hub tabs — scrollable row, red active underline under label. */
export const MatchHubTabs = ({
  active,
  onChange,
  myMatchesCount = 0,
  teamsCount = 0,
  className,
}: MatchHubTabsProps): JSX.Element => {
  const palette = useDream11Palette();

  const tabs: ReadonlyArray<{ id: MatchHubTabId; label: string }> = [
    { id: 'contests', label: 'Contests' },
    { id: 'my-contests', label: formatCountLabel('My Contests', myMatchesCount) },
    { id: 'teams', label: formatCountLabel('Teams', teamsCount) },
    { id: 'gurus', label: 'Gurus' },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <nav
      aria-label="Match sections"
      className={cn('border-b bg-white', className)}
      style={{ borderColor: palette.tabBorder }}
    >
      <div className="flex items-stretch gap-0.5 overflow-x-auto px-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative shrink-0 px-2 py-2.5 text-[12px] font-bold leading-none whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d82d2c]/25',
              )}
              style={{ color: selected ? palette.red : palette.textPrimary }}
            >
              {tab.label}
              {selected ? (
                <span
                  aria-hidden
                  className="absolute inset-x-1 bottom-0 h-[2.5px] rounded-full"
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
