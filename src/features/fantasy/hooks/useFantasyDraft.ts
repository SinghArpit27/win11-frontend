import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useDebounce } from '@hooks/useDebounce';

import {
  useListMyFantasyDraftsQuery,
  useUpsertFantasyDraftMutation,
} from '../fantasy.api';
import type { FantasyDraft, FantasyDraftSelection } from '../fantasy.types';

/**
 * Stateful hook for managing a fantasy team draft in progress.
 *
 *  Responsibilities:
 *   - Hydrates state from the most recent server-side draft on mount.
 *   - Exposes immutable update helpers (`toggleSelection`, `setCaptain`,
 *     `setViceCaptain`, `setName`).
 *   - Debounce-saves to the backend ~800ms after the last edit so we
 *     don't pummel the server on every click.
 *   - Survives reloads (server-side persistence) AND tab swaps (we
 *     re-hydrate from the cached query on mount).
 *
 *  The hook does not validate — the caller composes with
 *  `useFantasyValidation`. Keeping validation separate means the hook
 *  has zero dependencies on rule shape and can be reused in non-fantasy
 *  flows later (e.g. lineup picker for live matches).
 */

const MAX_SELECTIONS = 30;
const AUTO_SAVE_DEBOUNCE_MS = 800;

interface UseFantasyDraftArgs {
  matchId: string;
  clientDraftId?: string | null;
  /** Pre-existing team to seed the draft from (e.g. edit flow). */
  initialSelections?: FantasyDraftSelection[];
  initialName?: string;
  enabled?: boolean;
}

interface UseFantasyDraftResult {
  selections: FantasyDraftSelection[];
  name: string;
  setName: (next: string) => void;
  isPlayerSelected: (playerId: string) => boolean;
  toggleSelection: (playerId: string) => void;
  removeSelection: (playerId: string) => void;
  setCaptain: (playerId: string) => void;
  setViceCaptain: (playerId: string) => void;
  clearSelections: () => void;
  resetFrom: (selections: FantasyDraftSelection[], name?: string) => void;
  isHydrated: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  savedDraft: FantasyDraft | null;
}

export const useFantasyDraft = ({
  matchId,
  clientDraftId = null,
  initialSelections,
  initialName,
  enabled = true,
}: UseFantasyDraftArgs): UseFantasyDraftResult => {
  const [selections, setSelections] = useState<FantasyDraftSelection[]>(
    () => initialSelections ?? [],
  );
  const [name, setName] = useState<string>(initialName ?? 'My team');
  const [isHydrated, setIsHydrated] = useState<boolean>(Boolean(initialSelections));
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const draftsQuery = useListMyFantasyDraftsQuery(
    { matchId },
    { skip: !enabled || Boolean(initialSelections) },
  );
  const [upsertDraft, { isLoading: isSaving, data: savedDraft }] = useUpsertFantasyDraftMutation();

  // Hydrate from server if no initial state was supplied
  useEffect(() => {
    if (!enabled) return;
    if (initialSelections) return;
    if (isHydrated) return;
    if (!draftsQuery.data) return;

    const slot =
      draftsQuery.data.find((d) => (d.clientDraftId ?? null) === clientDraftId) ??
      draftsQuery.data[0];
    if (slot) {
      setSelections(
        slot.players.map((p) => ({
          playerId: p.playerId,
          isCaptain: p.isCaptain,
          isViceCaptain: p.isViceCaptain,
        })),
      );
      setName(slot.name || 'My team');
      setLastSavedAt(new Date(slot.lastEditedAt));
    }
    setIsHydrated(true);
  }, [draftsQuery.data, isHydrated, enabled, initialSelections, clientDraftId]);

  // Debounced auto-save
  const debouncedSelections = useDebounce(selections, AUTO_SAVE_DEBOUNCE_MS);
  const debouncedName = useDebounce(name, AUTO_SAVE_DEBOUNCE_MS);
  const lastPersistedSnapshot = useRef<string>('');

  useEffect(() => {
    if (!enabled || !isHydrated) return;
    // Don't save empty drafts on first hydration — avoids spamming the
    // server with no-op writes when the user merely opens the screen.
    if (debouncedSelections.length === 0 && lastPersistedSnapshot.current === '') return;

    const payload = {
      matchId,
      clientDraftId,
      name: debouncedName,
      players: debouncedSelections,
    };
    const snapshot = JSON.stringify(payload);
    if (snapshot === lastPersistedSnapshot.current) return;

    lastPersistedSnapshot.current = snapshot;
    upsertDraft(payload)
      .unwrap()
      .then(() => setLastSavedAt(new Date()))
      .catch(() => {
        // Swallow — auto-save errors don't block UX. The next change will
        // retry. The hook caller can surface a toast if it cares.
      });
  }, [
    debouncedSelections,
    debouncedName,
    enabled,
    isHydrated,
    matchId,
    clientDraftId,
    upsertDraft,
  ]);

  const isPlayerSelected = useCallback(
    (playerId: string) => selections.some((s) => s.playerId === playerId),
    [selections],
  );

  const toggleSelection = useCallback((playerId: string) => {
    setSelections((prev) => {
      const existing = prev.findIndex((s) => s.playerId === playerId);
      if (existing >= 0) {
        return prev.filter((_, idx) => idx !== existing);
      }
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, { playerId, isCaptain: false, isViceCaptain: false }];
    });
  }, []);

  const removeSelection = useCallback((playerId: string) => {
    setSelections((prev) => prev.filter((s) => s.playerId !== playerId));
  }, []);

  const setCaptain = useCallback((playerId: string) => {
    setSelections((prev) =>
      prev.map((s) =>
        s.playerId === playerId
          ? { ...s, isCaptain: true, isViceCaptain: false }
          : { ...s, isCaptain: false },
      ),
    );
  }, []);

  const setViceCaptain = useCallback((playerId: string) => {
    setSelections((prev) =>
      prev.map((s) =>
        s.playerId === playerId
          ? { ...s, isViceCaptain: true, isCaptain: false }
          : { ...s, isViceCaptain: false },
      ),
    );
  }, []);

  const clearSelections = useCallback(() => {
    setSelections([]);
  }, []);

  const resetFrom = useCallback((next: FantasyDraftSelection[], nextName?: string) => {
    setSelections(next);
    if (nextName) setName(nextName);
  }, []);

  return useMemo<UseFantasyDraftResult>(
    () => ({
      selections,
      name,
      setName,
      isPlayerSelected,
      toggleSelection,
      removeSelection,
      setCaptain,
      setViceCaptain,
      clearSelections,
      resetFrom,
      isHydrated,
      isSaving,
      lastSavedAt,
      savedDraft: savedDraft ?? null,
    }),
    [
      selections,
      name,
      isPlayerSelected,
      toggleSelection,
      removeSelection,
      setCaptain,
      setViceCaptain,
      clearSelections,
      resetFrom,
      isHydrated,
      isSaving,
      lastSavedAt,
      savedDraft,
    ],
  );
};
