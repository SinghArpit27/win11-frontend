import { SlidersHorizontal, X } from 'lucide-react';

import { useDream11Palette } from '@features/sports/hooks/useDream11Palette';
import { cn } from '@utils/cn';

import type { ContestSortKey } from './ContestFilters';

const CHIPS: ReadonlyArray<{ sort: ContestSortKey; label: string }> = [
  { sort: 'entry-asc', label: 'Entry' },
  { sort: 'spots', label: 'Spots' },
  { sort: 'prize', label: 'Prize Pool' },
  { sort: 'entry-desc', label: '% Winners' },
];

interface Dream11ContestFilterChipsProps {
  activeSort: ContestSortKey;
  defaultSort?: ContestSortKey;
  onSortChange: (sort: ContestSortKey) => void;
  onClearSort?: () => void;
  onFilterClick?: () => void;
  contestCount?: number;
  advancedFilterCount?: number;
  onClearAdvanced?: () => void;
  className?: string;
}

export const Dream11ContestFilterChips = ({
  activeSort,
  defaultSort = 'prize',
  onSortChange,
  onClearSort,
  onFilterClick,
  contestCount,
  advancedFilterCount = 0,
  onClearAdvanced,
  className,
}: Dream11ContestFilterChipsProps): JSX.Element => {
  const palette = useDream11Palette();
  const sortApplied = activeSort !== defaultSort;

  const chipLabel = (chip: (typeof CHIPS)[number]): string => {
    if (activeSort !== chip.sort || !sortApplied) return chip.label;
    if (chip.sort === 'entry-asc') return 'Entry ↓';
    if (chip.sort === 'spots') return 'Spots ↓';
    if (chip.sort === 'prize') return 'Prize Pool ↓';
    if (chip.sort === 'entry-desc') return '% Winners ↓';
    return chip.label;
  };

  return (
    <div
      className={cn(className)}
      style={{ backgroundColor: palette.tabBar }}
    >
      <div className="flex items-center gap-2 px-2.5 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {CHIPS.map((chip) => {
            const selected = activeSort === chip.sort && sortApplied;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => onSortChange(chip.sort)}
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full border px-3 py-[5px] text-[12px] leading-none',
                  selected ? 'font-semibold' : 'font-normal',
                )}
                style={{
                  borderColor: selected ? palette.red : '#e0e0e0',
                  backgroundColor: palette.card,
                  color: selected ? palette.red : palette.textPrimary,
                }}
              >
                {chipLabel(chip)}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          aria-label="Open filters"
          onClick={onFilterClick}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
          style={{
            borderColor: '#e0e0e0',
            backgroundColor: palette.card,
            color: palette.textTertiary,
          }}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div
        className="flex items-center justify-between border-t px-2.5 py-2 text-[11px] leading-none"
        style={{
          borderColor: palette.border,
          backgroundColor: palette.greyBg,
        }}
      >
        <span className="font-normal" style={{ color: palette.textPrimary }}>
          {contestCount ?? 0} Contests
        </span>
        <div className="flex items-center gap-3">
          {advancedFilterCount > 0 ? (
            <button
              type="button"
              onClick={onClearAdvanced}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide"
              style={{ color: palette.textSecondary }}
            >
              <span>
                {advancedFilterCount} Filter{advancedFilterCount === 1 ? '' : 's'} applied
              </span>
              <span className="font-bold" style={{ color: palette.red }}>
                CLEAR
              </span>
              <X className="h-3 w-3" style={{ color: palette.red }} />
            </button>
          ) : null}
          {sortApplied ? (
            <button
              type="button"
              onClick={onClearSort}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide"
              style={{ color: palette.textSecondary }}
            >
              <span>1 Sort applied</span>
              <span className="font-bold" style={{ color: palette.red }}>
                CLEAR
              </span>
              <X className="h-3 w-3" style={{ color: palette.red }} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
