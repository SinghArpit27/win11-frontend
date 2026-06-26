import { ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';

import { Typography } from '@components/ui';
import { cn } from '@utils/cn';

import type { SportsMatchSummary } from '../sports.types';
import { useDream11Palette } from '../hooks/useDream11Palette';
import { MatchCard } from './MatchCard';

interface MatchListSectionProps {
  title: string;
  subtitle?: string;
  matches: SportsMatchSummary[] | undefined;
  loading?: boolean;
  onViewAll?: () => void;
  emptyHint?: string;
  compact?: boolean;
  className?: string;
  trailing?: ReactNode;
}

/** Repeatable match section — Dream11 cards in a compact vertical list. */
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
  const palette = useDream11Palette();
  const hasMatches = !loading && matches && matches.length > 0;
  const isEmpty = !loading && (!matches || matches.length === 0);

  return (
    <section className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Typography
            variant="h3"
            className="text-xl font-bold sm:text-2xl"
            style={{ color: palette.textPrimary }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="caption"
              tone="muted"
              className="block"
              style={{ color: palette.textMuted }}
            >
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
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d82d2c]/30"
              style={{ color: palette.red }}
            >
              See all
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: compact ? 4 : 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[130px] w-full animate-pulse rounded-[10px] border"
              style={{
                borderColor: palette.border,
                backgroundColor: palette.card,
              }}
            />
          ))}
        </div>
      ) : null}

      {hasMatches ? (
        <div className="flex flex-col gap-2">
          {matches!.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              appearance="dream11"
              variant={compact ? 'compact' : 'default'}
            />
          ))}
        </div>
      ) : null}

      {isEmpty ? (
        <div
          className="rounded-xl border border-dashed px-4 py-8 text-center"
          style={{
            borderColor: palette.border,
            backgroundColor: palette.card,
            color: palette.textMuted,
          }}
        >
          <Typography variant="caption" tone="muted">
            {emptyHint ?? 'No matches to show right now.'}
          </Typography>
        </div>
      ) : null}
    </section>
  );
};
