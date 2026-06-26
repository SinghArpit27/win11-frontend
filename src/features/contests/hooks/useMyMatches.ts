import { useEffect, useMemo, useState } from 'react';

import { useAppDispatch } from '@hooks/index';
import { useListMyFantasyTeamsQuery } from '@features/fantasy/fantasy.api';
import { sportsApi, useListMatchesQuery } from '@features/sports/sports.api';
import type { SportsMatchSummary } from '@features/sports/sports.types';

import { useListMyContestEntriesQuery } from '../contest.api';
import {
  buildMyMatchRows,
  type MyMatchRow,
  type MyMatchesTabId,
} from '../my-matches.utils';

interface UseMyMatchesResult {
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  rowsByTab: Record<MyMatchesTabId, MyMatchRow[]>;
}

export const useMyMatches = (): UseMyMatchesResult => {
  const dispatch = useAppDispatch();
  const entriesQuery = useListMyContestEntriesQuery({ limit: 100 });
  const teamsQuery = useListMyFantasyTeamsQuery({ limit: 100 });
  const matchesQuery = useListMatchesQuery({ limit: 100, page: 1 });

  const [extraMatches, setExtraMatches] = useState<SportsMatchSummary[]>([]);

  const matchIds = useMemo(() => {
    const ids = new Set<string>();
    for (const entry of entriesQuery.data?.items ?? []) ids.add(entry.matchId);
    for (const team of teamsQuery.data?.items ?? []) ids.add(team.matchId);
    return [...ids];
  }, [entriesQuery.data, teamsQuery.data]);

  useEffect(() => {
    const listed = new Set((matchesQuery.data?.items ?? []).map((m) => m.id));
    const missing = matchIds.filter((id) => !listed.has(id));
    if (missing.length === 0) {
      setExtraMatches([]);
      return;
    }

    let cancelled = false;
    void (async () => {
      const fetched = await Promise.all(
        missing.map((matchId) =>
          dispatch(sportsApi.endpoints.getMatchDetail.initiate({ matchId })).unwrap(),
        ),
      );
      if (!cancelled) setExtraMatches(fetched);
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, matchIds, matchesQuery.data]);

  const allMatches = useMemo(
    () => [...(matchesQuery.data?.items ?? []), ...extraMatches],
    [matchesQuery.data, extraMatches],
  );

  const rows = useMemo(
    () =>
      buildMyMatchRows(
        teamsQuery.data?.items ?? [],
        entriesQuery.data?.items ?? [],
        allMatches,
      ),
    [teamsQuery.data, entriesQuery.data, allMatches],
  );

  const rowsByTab = useMemo(
    () => ({
      upcoming: rows.filter((r) => r.tab === 'upcoming'),
      live: rows.filter((r) => r.tab === 'live'),
      completed: rows.filter((r) => r.tab === 'completed'),
    }),
    [rows],
  );

  const isLoading =
    entriesQuery.isLoading || teamsQuery.isLoading || matchesQuery.isLoading;
  const isError =
    entriesQuery.isError || teamsQuery.isError || matchesQuery.isError;

  const refetch = (): void => {
    void entriesQuery.refetch();
    void teamsQuery.refetch();
    void matchesQuery.refetch();
  };

  return { isLoading, isError, refetch, rowsByTab };
};
