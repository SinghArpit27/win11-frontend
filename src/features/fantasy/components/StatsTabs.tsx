import { ChevronRight } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

/**
 * Horizontal scrollable strip of match-context "stat" pills.
 *
 *  Visual reference (Dream11 / My11Circle):
 *   - First pill is the title "STATS ›" (renders as an active dark pill).
 *   - Following pills are key/value tidbits: "Pitch: Bowling",
 *     "Good For: Balance", "Avg Score: 111", "Venue", etc.
 *   - Strip sits between the dark header and the role-tab strip and
 *     scrolls horizontally on narrow viewports.
 *
 *  Pure presentational — the values are provided by the screen.
 */
export interface StatsTabItem {
  id: string;
  label: string;
}

interface StatsTabsProps {
  items: StatsTabItem[];
  onTitleClick?: () => void;
  className?: string;
}

const StatsTabsComponent = ({ items, onTitleClick, className }: StatsTabsProps): JSX.Element => (
  <div
    className={cn(
      'flex items-center gap-2 overflow-x-auto bg-gradient-fantasy-header px-3 py-2 text-text-inverse sm:px-4',
      '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
      className,
    )}
  >
    <button
      type="button"
      onClick={onTitleClick}
      className="flex shrink-0 items-center gap-0.5 rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      Stats <ChevronRight className="h-3 w-3" />
    </button>
    {items.map((item, idx) => (
      <span key={item.id} className="flex shrink-0 items-center gap-2 text-[11px] text-text-inverse/70">
        <span className="opacity-50">|</span>
        <span className="font-medium text-text-inverse/90">{item.label}</span>
        {idx === items.length - 1 ? null : null}
      </span>
    ))}
  </div>
);

export const StatsTabs = memo(StatsTabsComponent);
