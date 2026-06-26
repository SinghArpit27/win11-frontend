import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageContainer } from '@components/layout';
import { Button, Input } from '@components/ui';
import { MatchStatus, Sport } from '@shared/enums';
import { cn } from '@utils/cn';

import { MatchCard, MatchCategoryChips } from '../components';
import { useDream11Palette } from '../hooks/useDream11Palette';
import { useListMatchesQuery, useListTournamentsQuery } from '../sports.api';

const STATUS_TABS: ReadonlyArray<{ value: MatchStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: MatchStatus.LIVE, label: 'Live' },
  { value: MatchStatus.UPCOMING, label: 'Upcoming' },
  { value: MatchStatus.COMPLETED, label: 'Completed' },
];

/** All-matches screen — Dream11-style list with light/dark palette support. */
const MatchesListScreen = (): JSX.Element => {
  const palette = useDream11Palette();
  const [params, setParams] = useSearchParams();

  const sport = (params.get('sport') as Sport | null) || null;
  const status = (params.get('status') as MatchStatus | null) || null;
  const tournamentId = params.get('tournamentId');
  const featured = params.get('featured') === 'true' || undefined;
  const q = params.get('q') ?? '';

  const [searchInput, setSearchInput] = useState(q);
  useEffect(() => setSearchInput(q), [q]);

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
    <PageContainer
      as="div"
      padded={false}
      width="wide"
      className="mx-0 min-h-full w-full max-w-none !px-0"
      style={{ backgroundColor: palette.greyBg }}
    >
      <div
        className="border-b px-3 py-3"
        style={{ borderColor: palette.tabBorder, backgroundColor: palette.tabBar }}
      >
        <h1
          className="text-base font-bold sm:text-lg"
          style={{ color: palette.textPrimary }}
        >
          All matches
        </h1>
        <p className="mt-0.5 text-xs" style={{ color: palette.textMuted }}>
          Live, upcoming, and completed fixtures
        </p>
      </div>

      <div className="flex flex-col gap-3 px-2 py-2">
        <MatchCategoryChips
          value={sport}
          onChange={(s) => updateParam('sport', s ?? null)}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Input
            placeholder="Search teams, tournaments…"
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
            className="h-11 rounded-lg border px-3 text-sm focus:border-[#d82d2c] focus:outline-none focus:ring-2 focus:ring-[#d82d2c]/20"
            style={{
              borderColor: palette.border,
              backgroundColor: palette.card,
              color: palette.textPrimary,
            }}
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

        <nav
          aria-label="Match status"
          className="border-b"
          style={{ borderColor: palette.tabBorder, backgroundColor: palette.tabBar }}
        >
          <div className="flex items-stretch overflow-x-auto">
            {STATUS_TABS.map((tab, index) => {
              const selected = (status ?? 'ALL') === tab.value;
              return (
                <div key={tab.value} className="flex shrink-0 items-stretch">
                  {index > 0 ? (
                    <span
                      aria-hidden
                      className="my-auto h-4 w-px shrink-0"
                      style={{ backgroundColor: palette.tabDivider }}
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={() =>
                      updateParam('status', tab.value === 'ALL' ? null : tab.value)
                    }
                    aria-pressed={selected}
                    className={cn(
                      'relative px-2.5 py-2.5 text-[12px] sm:px-3 sm:text-[13px]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d82d2c]/25',
                      selected ? 'font-bold' : 'font-normal',
                    )}
                    style={{ color: selected ? palette.red : palette.tabInactive }}
                  >
                    {tab.label}
                    {selected ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-2 bottom-0 h-[2px] rounded-full"
                        style={{ backgroundColor: palette.red }}
                      />
                    ) : null}
                  </button>
                </div>
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
        </nav>

        {matchesQuery.isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
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
        ) : matchesQuery.data && matchesQuery.data.items.length > 0 ? (
          <div className="flex flex-col gap-2">
            {matchesQuery.data.items.map((m) => (
              <MatchCard key={m.id} match={m} appearance="dream11" />
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl border border-dashed px-4 py-12 text-center"
            style={{
              borderColor: palette.border,
              backgroundColor: palette.card,
              color: palette.textMuted,
            }}
          >
            <p className="text-sm font-semibold" style={{ color: palette.textPrimary }}>
              {hasFilters ? 'No matches match these filters' : 'No matches available yet'}
            </p>
            <p className="mt-1 text-xs">
              {hasFilters
                ? 'Try removing a filter or pick a different sport.'
                : 'Catalogue refreshes automatically. Try again shortly.'}
            </p>
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
      </div>
    </PageContainer>
  );
};

export default MatchesListScreen;
