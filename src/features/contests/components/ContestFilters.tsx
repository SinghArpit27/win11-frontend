import { ArrowDownUp, EyeOff, Search } from 'lucide-react';
import { memo, useId } from 'react';

import { Input } from '@components/ui';
import { cn } from '@utils/cn';

export type ContestSortKey = 'prize' | 'entry-asc' | 'entry-desc' | 'spots';

export interface ContestFiltersValue {
  query: string;
  hideFull: boolean;
  sort: ContestSortKey;
}

interface ContestFiltersProps {
  value: ContestFiltersValue;
  onChange: (next: ContestFiltersValue) => void;
  className?: string;
  /** Hide the search input — useful on a tab with very few contests. */
  hideSearch?: boolean;
}

const SORT_OPTIONS: ReadonlyArray<{ id: ContestSortKey; label: string }> = [
  { id: 'prize', label: 'Top prize' },
  { id: 'entry-asc', label: 'Entry: low → high' },
  { id: 'entry-desc', label: 'Entry: high → low' },
  { id: 'spots', label: 'Spots left' },
];

/**
 * Search / sort / hide-full filter bar for the contests list.
 *
 *   Mobile  : stacks search → controls.
 *   Tablet+ : one row, search grows, controls shrink to their content.
 */
const ContestFiltersComponent = ({
  value,
  onChange,
  className,
  hideSearch = false,
}: ContestFiltersProps): JSX.Element => {
  const id = useId();
  const update = <K extends keyof ContestFiltersValue>(
    key: K,
    next: ContestFiltersValue[K],
  ): void => {
    onChange({ ...value, [key]: next });
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3',
        className,
      )}
    >
      {!hideSearch && (
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <Input
            id={`${id}-q`}
            value={value.query}
            placeholder="Search contests"
            onChange={(e) => update('query', e.target.value)}
            className="pl-9"
            aria-label="Search contests"
          />
        </div>
      )}

      <label
        htmlFor={`${id}-sort`}
        className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-muted shadow-sm"
      >
        <ArrowDownUp className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Sort</span>
        <select
          id={`${id}-sort`}
          value={value.sort}
          onChange={(e) => update('sort', e.target.value as ContestSortKey)}
          className="bg-transparent text-xs font-semibold text-text outline-none"
          aria-label="Sort contests"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-surface text-text">
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label
        className={cn(
          'inline-flex shrink-0 cursor-pointer select-none items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
          value.hideFull
            ? 'border-primary bg-primary-soft text-primary'
            : 'border-border bg-surface text-text-muted hover:text-text',
        )}
      >
        <EyeOff className="h-3.5 w-3.5" aria-hidden />
        Hide full
        <input
          type="checkbox"
          checked={value.hideFull}
          onChange={(e) => update('hideFull', e.target.checked)}
          className="sr-only"
        />
      </label>
    </div>
  );
};

export const ContestFilters = memo(ContestFiltersComponent);
ContestFilters.displayName = 'ContestFilters';
