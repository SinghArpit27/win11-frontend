import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageContainer, PageHeader, ResponsiveGrid } from '@components/layout';
import { Button, Input, Skeleton, Typography } from '@components/ui';
import { MatchStatus, Sport } from '@shared/enums';

import { useListMatchesQuery, useListTournamentsQuery } from '../sports.api';
import { MatchCard, MatchCategoryChips } from '../components';

/**
 * All-matches discovery screen.
 *
 *  Filter contract (kept in the URL so links are shareable):
 *   - `?sport=CRICKET`        — primary chip
 *   - `?status=LIVE|UPCOMING` — status tab
 *   - `?tournamentId=…`        — tournament drop chip
 *   - `?q=…`                   — text search
 *
 *  Responsive layout:
 *   - mobile  → stack: header → chips → search → cards (1 col),
 *   - tablet+ → header inline, chips wrap, 2-col card grid,
 *   - desktop → 3-col card grid + tournament filter inline.
 *
 *  Pagination kept simple (page/limit) — Phase 5 will introduce
 *  infinite scroll once contests amplify list lengths.
 */
const STATUS_TABS: ReadonlyArray<{ value: MatchStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: MatchStatus.LIVE, label: 'Live' },
  { value: MatchStatus.UPCOMING, label: 'Upcoming' },
  { value: MatchStatus.COMPLETED, label: 'Completed' },
];

const MatchesListScreen = (): JSX.Element => {
  const [params, setParams] = useSearchParams();

  const sport = (params.get('sport') as Sport | null) || null;
  const status = (params.get('status') as MatchStatus | null) || null;
  const tournamentId = params.get('tournamentId');
  const featured = params.get('featured') === 'true' || undefined;
  const q = params.get('q') ?? '';

  // Buffered search term so we don't refetch on every keystroke.
  const [searchInput, setSearchInput] = useState(q);
  useEffect(() => setSearchInput(q), [q]);

  // Debounce search → URL → query.
  useEffect(() => {
    if (searchInput === q) return;
    const t = setTimeout(() => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (searchInput) next.set('q', searchInput);
          else next.delete('q');
          return next;
        },
        { replace: true },
      );
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput, q, setParams]);

  const queryArgs = useMemo(
    () => ({
      page: 1,
      limit: 24,
      sport: sport ?? undefined,
      status: status ?? undefined,
      tournamentId: tournamentId ?? undefined,
      featured,
      q: q || undefined,
      sortBy: 'scheduledAt',
      sortOrder: status === MatchStatus.COMPLETED ? ('desc' as const) : ('asc' as const),
    }),
    [sport, status, tournamentId, featured, q],
  );

  const matchesQuery = useListMatchesQuery(queryArgs);
  const tournamentsQuery = useListTournamentsQuery({ sport: sport ?? undefined, limit: 50 });

  const updateParam = (key: string, value: string | null): void => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  };

  const hasFilters = !!(sport || status || tournamentId || q || featured);

  return (
    <PageContainer as="div" className="gap-5 lg:gap-6">
      <PageHeader
        eyebrow="Matches"
        title="All matches"
        subtitle="Live, upcoming, and completed fixtures across every sport."
      />

      <MatchCategoryChips
        value={sport}
        onChange={(s) => updateParam('sport', s ?? null)}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Input
          placeholder="Search teams, tournaments, players…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          leftAdornment={<Search className="h-4 w-4" />}
          rightAdornment={
            searchInput ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParam('q', null);
                }}
                className="rounded p-0.5 text-text-muted hover:text-text"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null
          }
          className="flex-1"
        />

        <select
          value={tournamentId ?? ''}
          onChange={(e) => updateParam('tournamentId', e.target.value || null)}
          className="h-11 rounded-lg border border-border bg-surface px-3 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-muted"
          aria-label="Filter by tournament"
        >
          <option value="">All tournaments</option>
          {tournamentsQuery.data?.items.map((t) => (
            <option key={t.id} value={t.id}>
              {t.shortName} {t.season ? `· ${t.season}` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-surface p-1">
        {STATUS_TABS.map((tab) => {
          const isActive = (status ?? 'ALL') === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => updateParam('status', tab.value === 'ALL' ? null : tab.value)}
              aria-pressed={isActive}
              className={
                'shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ' +
                (isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-text-muted hover:text-text')
              }
            >
              {tab.label}
            </button>
          );
        })}
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<SlidersHorizontal className="h-3.5 w-3.5" />}
            onClick={() => setParams(new URLSearchParams(), { replace: true })}
            className="ml-auto shrink-0"
          >
            Reset
          </Button>
        ) : null}
      </div>

      {/* Results grid */}
      {matchesQuery.isLoading ? (
        <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap="md">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </ResponsiveGrid>
      ) : matchesQuery.data && matchesQuery.data.items.length > 0 ? (
        <ResponsiveGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap="md">
          {matchesQuery.data.items.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </ResponsiveGrid>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-12 text-center">
          <Typography variant="h4" className="block">
            {hasFilters ? 'No matches match these filters' : 'No matches available yet'}
          </Typography>
          <Typography variant="caption" tone="muted" className="mt-1 block">
            {hasFilters
              ? 'Try removing a filter or pick a different sport.'
              : 'Catalogue refreshes automatically every few minutes. Try again shortly.'}
          </Typography>
          <div className="mt-4 flex items-center justify-center gap-2">
            {hasFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
              >
                Reset filters
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="sm"
              loading={matchesQuery.isFetching}
              onClick={() => matchesQuery.refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default MatchesListScreen;
