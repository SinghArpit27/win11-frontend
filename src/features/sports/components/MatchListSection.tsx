import { ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';

import { Skeleton, Typography } from '@components/ui';
import { ResponsiveGrid } from '@components/layout';
import { cn } from '@utils/cn';

import type { SportsMatchSummary } from '../sports.types';
import { MatchCard } from './MatchCard';

/**
 * Repeatable "Live now" / "Upcoming" / "Featured" section.
 *
 *  Renders a section header with an optional "See all" link + a
 *  responsive grid of `MatchCard`s. The grid follows the global
 *  responsive breakpoints:
 *    base = 1 column (phone)
 *    sm   = 2 columns (tablet)
 *    lg   = 3 columns (desktop)
 *    xl   = 4 columns (wide desktop)
 *
 *  Loading state uses theme-aware `Skeleton` placeholders.
 *
 *  Composability: pass `compact` to switch every card to the compact
 *  row variant — useful for "Recent results" lists.
 */
interface MatchListSectionProps {
  title: string;
  subtitle?: string;
  matches: SportsMatchSummary[] | undefined;
  loading?: boolean;
  /** When non-null, renders a "See all" affordance. */
  onViewAll?: () => void;
  /** Show empty state instead of nothing when there are no matches. */
  emptyHint?: string;
  compact?: boolean;
  className?: string;
  /** Custom trailing element next to the title (e.g. a sport chip rail). */
  trailing?: ReactNode;
}

export const MatchListSection = ({
  title,
  subtitle,
  matches,
  loading,
  onViewAll,
  emptyHint,
  compact,
  className,
  trailing,
}: MatchListSectionProps): JSX.Element => {
  const hasMatches = !loading && matches && matches.length > 0;
  const isEmpty = !loading && (!matches || matches.length === 0);

  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Typography variant="h3" className="text-xl font-bold sm:text-2xl">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" tone="muted" className="block">
              {subtitle}
            </Typography>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {trailing}
          {onViewAll ? (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              See all
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 3, xl: compact ? 2 : 4 }} gap="md">
          {Array.from({ length: compact ? 4 : 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </ResponsiveGrid>
      ) : null}

      {hasMatches ? (
        compact ? (
          <div className="flex flex-col gap-2">
            {matches!.map((m) => (
              <MatchCard key={m.id} match={m} variant="compact" />
            ))}
          </div>
        ) : (
          <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap="md">
            {matches!.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </ResponsiveGrid>
        )
      ) : null}

      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center">
          <Typography variant="caption" tone="muted">
            {emptyHint ?? 'No matches to show right now.'}
          </Typography>
        </div>
      ) : null}
    </section>
  );
};
