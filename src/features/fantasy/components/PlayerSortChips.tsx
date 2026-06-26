import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react';
import { memo } from 'react';

import { cn } from '@utils/cn';

export type PlayerSortField = 'credits' | 'selectionPercent' | 'points' | 'runs' | 'wickets';

interface PlayerSortChipsProps {
  active: PlayerSortField;
  direction: 'asc' | 'desc';
  onChange: (field: PlayerSortField) => void;
  className?: string;
}

const SORT_OPTIONS: { id: PlayerSortField; label: string }[] = [
  { id: 'credits', label: 'Credits' },
  { id: 'selectionPercent', label: '% Selected By' },
  { id: 'points', label: 'Points' },
  { id: 'runs', label: 'Runs' },
  { id: 'wickets', label: 'Wickets' },
];

const PlayerSortChipsComponent = ({
  active,
  direction,
  onChange,
  className,
}: PlayerSortChipsProps): JSX.Element => (
  <div
    className={cn(
      'flex items-center gap-2 overflow-x-auto border-b border-[#eeeeee] bg-white px-3 py-2',
      '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
      className,
    )}
  >
    {SORT_OPTIONS.map((opt) => {
      const isActive = active === opt.id;
      const SortIcon = isActive ? (direction === 'desc' ? ChevronDown : ChevronUp) : null;
      return (
        <button
          key={opt.id}
          type="button"
          aria-pressed={isActive}
          onClick={() => onChange(opt.id)}
          className={cn(
            'flex shrink-0 items-center gap-0.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors',
            isActive
              ? 'border-[#212121] bg-white text-[#000000]'
              : 'border-[#e0e0e0] bg-white text-[#424242] hover:border-[#bdbdbd]',
          )}
        >
          {opt.label}
          {SortIcon ? <SortIcon className="h-3 w-3" aria-hidden /> : null}
        </button>
      );
    })}
    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-[#bdbdbd]" aria-hidden />
  </div>
);

export const PlayerSortChips = memo(PlayerSortChipsComponent);
