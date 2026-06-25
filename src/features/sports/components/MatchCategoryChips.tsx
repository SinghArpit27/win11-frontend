import { LayoutGrid } from 'lucide-react';
import { useMemo } from 'react';

import { Sport } from '@shared/enums';

import { cn } from '@utils/cn';

import { SPORT_ICON_HINT, SPORT_LABELS } from '../sports.utils';

/**
 * Horizontally-scrollable chip rail for filtering by sport.
 *
 *  Mobile  : true horizontal scroll, snap-x for tactile feel.
 *  Desktop : wraps to a single row (no scroll bar needed when the chip
 *            set is small).
 *
 *  Accessibility:
 *   - Each chip is a button with `aria-pressed` reflecting its active
 *     state so screen readers can announce the selection.
 *   - The "All" chip uses `null` as the value, mirroring the API
 *     contract (omit `sport` to query every sport).
 */
interface MatchCategoryChipsProps {
  value: Sport | null;
  onChange: (next: Sport | null) => void;
  /** Optionally restrict the shown chips (e.g. hide kabaddi on football screens). */
  allowed?: ReadonlyArray<Sport>;
  className?: string;
}

export const MatchCategoryChips = ({
  value,
  onChange,
  allowed,
  className,
}: MatchCategoryChipsProps): JSX.Element => {
  const chips = useMemo(() => {
    const list = allowed && allowed.length ? allowed : (Object.values(Sport) as Sport[]);
    return [
      { id: 'ALL' as const, label: 'All', sport: null as Sport | null, hint: null },
      ...list.map((s) => ({
        id: s,
        label: SPORT_LABELS[s],
        sport: s as Sport | null,
        hint: SPORT_ICON_HINT[s] ?? null,
      })),
    ];
  }, [allowed]);

  return (
    <div
      role="tablist"
      aria-label="Filter matches by sport"
      className={cn(
        'flex w-full snap-x snap-mandatory items-center gap-2 overflow-x-auto',
        'pb-1 -mx-1 px-1 lg:flex-wrap lg:overflow-visible',
        '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
    >
      {chips.map((chip) => {
        const active = chip.sport === value;
        return (
          <button
            key={chip.id}
            role="tab"
            type="button"
            aria-pressed={active}
            onClick={() => onChange(chip.sport)}
            className={cn(
              'inline-flex shrink-0 snap-start items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
              'min-h-[36px] touch-manipulation',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-surface text-text hover:bg-surface-hover',
            )}
          >
            {chip.hint ? (
              <span aria-hidden className="text-sm leading-none">
                {chip.hint}
              </span>
            ) : (
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
            )}
            {chip.label}
          </button>
        );
      })}
    </div>
  );
};
