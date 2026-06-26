import { ChevronRight } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

/**
 * Dream11 match insights strip — sits directly under the dark header.
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
      'flex items-center gap-0 overflow-x-auto bg-gradient-fantasy-header px-3 py-2 text-white sm:px-4',
      '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
      className,
    )}
  >
    <button
      type="button"
      onClick={onTitleClick}
      className="flex shrink-0 items-center gap-0.5 pr-2 text-[11px] font-bold uppercase tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      Stats <ChevronRight className="h-3 w-3" />
    </button>
    {items.map((item) => (
      <span
        key={item.id}
        className="flex shrink-0 items-center gap-2 border-l border-white/20 pl-2 text-[11px] font-medium text-white/90"
      >
        {item.label}
      </span>
    ))}
  </div>
);

export const StatsTabs = memo(StatsTabsComponent);
