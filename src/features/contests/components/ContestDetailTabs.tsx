import { cn } from '@utils/cn';

export type ContestDetailTabId = 'winnings' | 'leaderboard';

interface ContestDetailTabsProps {
  active: ContestDetailTabId;
  onChange: (tab: ContestDetailTabId) => void;
}

const TABS: Array<{ id: ContestDetailTabId; label: string }> = [
  { id: 'winnings', label: 'Winnings' },
  { id: 'leaderboard', label: 'Leaderboard' },
];

export const ContestDetailTabs = ({
  active,
  onChange,
}: ContestDetailTabsProps): JSX.Element => (
  <div
    className="flex border-b"
    style={{ borderColor: '#e0e0e0', backgroundColor: '#fff' }}
  >
    {TABS.map((tab) => {
      const isActive = active === tab.id;
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative flex-1 py-3 text-[13px] font-semibold transition-colors',
            isActive ? 'text-[#e53935]' : 'text-[#757575]',
          )}
        >
          {tab.label}
          {isActive ? (
            <span
              aria-hidden
              className="absolute inset-x-4 bottom-0 h-[3px] rounded-t-full"
              style={{ backgroundColor: '#e53935' }}
            />
          ) : null}
        </button>
      );
    })}
  </div>
);
