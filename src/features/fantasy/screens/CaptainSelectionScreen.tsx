import { ChevronDown, Eye } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { cn } from '@utils/cn';
import { buildContestConfirmJoinRoute, buildRoute } from '@utils/routes.util';

import {
  CaptainListRow,
  FantasyFlowShell,
  FantasyMatchHeader,
  FantasySortChip,
  FantasyStickyFooter,
  ValidationFeedback,
  fantasyFooterBtn,
} from '../components';
import {
  useCreateFantasyTeamMutation,
  useGetFantasyMatchContextQuery,
  useGetMyFantasyTeamQuery,
  useUpdateFantasyTeamMutation,
} from '../fantasy.api';
import type { FantasyDraftSelection, FantasyMatchPlayer } from '../fantasy.types';
import { useFantasyValidation } from '../hooks';

/**
 * Step 2 of the create-team flow — Dream11-style captain picker.
 *
 *  Layout:
 *   - Dark `FantasyMatchHeader` with the secondary slot showing the
 *     current `C` and `VC` selections and the multipliers.
 *   - Filter chips row (Type, Points, % Captain By, % Vice Captain By).
 *   - Player list — each row uses `CaptainListRow`.
 *   - Sticky `FantasyPillActionBar` with PREVIEW, PAST LINEUP, and SAVE.
 *
 *  Save flow:
 *   - `editTeamId` → `PATCH /fantasy/teams/:id` then route to detail.
 *   - else        → `POST  /fantasy/teams`       then route to detail.
 */

interface LocationState {
  selections?: FantasyDraftSelection[];
  name?: string;
}

type SortKey = 'role' | 'points' | 'captainPct' | 'viceCaptainPct';

const CaptainSelectionScreen = (): JSX.Element => {
  const { matchId = '' } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const editTeamId = params.get('editTeamId');
  const cloneTeamId = params.get('cloneTeamId');
  const contestId = params.get('contestId');

  const navState = (location.state ?? {}) as LocationState;
  const [selections, setSelections] = useState<FantasyDraftSelection[]>(
    navState.selections ?? [],
  );
  const [teamName, setTeamName] = useState<string>(navState.name ?? 'My team');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('role');

  const ctxQuery = useGetFantasyMatchContextQuery({ matchId }, { skip: !matchId });
  const seedTeamQuery = useGetMyFantasyTeamQuery(
    { teamId: (editTeamId ?? cloneTeamId) ?? '' },
    { skip: (!editTeamId && !cloneTeamId) || selections.length > 0 },
  );

  // One-shot seed when the user lands here directly (refresh).
  useEffect(() => {
    if (selections.length > 0) return;
    if (!seedTeamQuery.data || seedTeamQuery.data.players.length === 0) return;
    const next: FantasyDraftSelection[] = seedTeamQuery.data.players.map((p) => ({
      playerId: p.playerId,
      isCaptain: p.isCaptain,
      isViceCaptain: p.isViceCaptain,
    }));
    setSelections(next);
    if (!navState.name && seedTeamQuery.data.name) setTeamName(seedTeamQuery.data.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedTeamQuery.data]);

  const [createTeam, createState] = useCreateFantasyTeamMutation();
  const [updateTeam, updateState] = useUpdateFantasyTeamMutation();
  const isSubmitting = createState.isLoading || updateState.isLoading;

  const validation = useFantasyValidation({
    rule: ctxQuery.data?.rule ?? null,
    selections,
    playerCatalogue: ctxQuery.data?.players,
    matchLocked: ctxQuery.data?.isLocked,
    isEdit: Boolean(editTeamId),
  });

  // Sort + filter selected players ──────────────────────────────────────
  const sortedPlayers = useMemo<FantasyMatchPlayer[]>(() => {
    if (!ctxQuery.data) return [];
    const idx = new Map(ctxQuery.data.players.map((p) => [p.id, p]));
    const list = selections
      .map((s) => idx.get(s.playerId))
      .filter((p): p is FantasyMatchPlayer => p !== undefined);
    switch (sortKey) {
      case 'points':
        // Phase 5 has no per-match points yet — fall back to credits.
        return [...list].sort((a, b) => b.credits - a.credits);
      case 'captainPct':
      case 'viceCaptainPct':
        return [...list].sort(
          (a, b) => (b.selectionPercent ?? 0) - (a.selectionPercent ?? 0),
        );
      case 'role':
      default: {
        const roleOrder = ['WICKET_KEEPER', 'BATSMAN', 'ALL_ROUNDER', 'BOWLER'];
        return [...list].sort((a, b) => {
          const ra = roleOrder.indexOf(a.role);
          const rb = roleOrder.indexOf(b.role);
          if (ra !== rb) return ra - rb;
          return b.credits - a.credits;
        });
      }
    }
  }, [ctxQuery.data, selections, sortKey]);

  const setCaptain = (playerId: string): void => {
    setSelections((prev) =>
      prev.map((s) =>
        s.playerId === playerId
          ? { ...s, isCaptain: true, isViceCaptain: false }
          : { ...s, isCaptain: false },
      ),
    );
  };

  const setViceCaptain = (playerId: string): void => {
    setSelections((prev) =>
      prev.map((s) =>
        s.playerId === playerId
          ? { ...s, isViceCaptain: true, isCaptain: false }
          : { ...s, isViceCaptain: false },
      ),
    );
  };

  const onSave = async (): Promise<void> => {
    setSubmitError(null);
    try {
      const payload = {
        matchId,
        name: teamName.trim() || 'My team',
        players: selections.map((s) => ({
          playerId: s.playerId,
          isCaptain: s.isCaptain,
          isViceCaptain: s.isViceCaptain,
        })),
      };
      if (editTeamId) {
        const team = await updateTeam({ teamId: editTeamId, ...payload }).unwrap();
        if (contestId) {
          navigate(buildContestConfirmJoinRoute(matchId, contestId, team.id), { replace: true });
        } else {
          navigate(
            ROUTES.FANTASY_TEAM_DETAIL.replace(':matchId', matchId).replace(':teamId', team.id),
          );
        }
      } else {
        const team = await createTeam(payload).unwrap();
        if (contestId) {
          navigate(buildContestConfirmJoinRoute(matchId, contestId, team.id), { replace: true });
        } else {
          navigate(
            ROUTES.FANTASY_TEAM_DETAIL.replace(':matchId', matchId).replace(':teamId', team.id),
          );
        }
      }
    } catch (err) {
      // RTK Query error shape after our envelope unwrapper:
      //   { status, data: { success: false, error: { code, message, details } }, error: '<short>' }
      // Try every reasonable location so the user always sees something useful.
      const apiErr = err as {
        status?: number | string;
        data?:
          | { error?: { code?: string; message?: string; details?: unknown }; message?: string }
          | string;
        error?: string;
        message?: string;
      };
      const envelopeError =
        typeof apiErr?.data === 'object' && apiErr.data !== null ? apiErr.data.error : undefined;
      const surfaceMessage =
        envelopeError?.message ??
        (typeof apiErr?.data === 'object' && apiErr.data && 'message' in apiErr.data
          ? (apiErr.data as { message?: string }).message
          : undefined) ??
        apiErr?.error ??
        apiErr?.message ??
        'Failed to save team.';
      // Surface the error code as well — invaluable for diagnostics.
      const codeSuffix = envelopeError?.code ? ` (${envelopeError.code})` : '';
      setSubmitError(`${surfaceMessage}${codeSuffix}`);
      // Also log to the console so the full payload is available when a
      // user reports the problem.
      // eslint-disable-next-line no-console
      console.error('[fantasy] save failed', err);
    }
  };

  if (ctxQuery.isLoading || seedTeamQuery.isFetching) {
    return (
      <FantasyFlowShell>
        <Skeleton className="h-32 w-full rounded-none" />
        <div className="flex flex-col gap-2 p-3">
          {Array.from({ length: 11 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      </FantasyFlowShell>
    );
  }
  const ctx = ctxQuery.data;
  if (!ctx || !ctx.rule || sortedPlayers.length === 0) {
    return (
      <FantasyFlowShell className="items-center justify-center px-6 py-12 text-center">
        <Typography variant="h3">Pick your players first</Typography>
        <Typography variant="caption" tone="muted">
          You need to select {ctx?.rule?.teamSize ?? 11} players before assigning C/VC.
        </Typography>
        <button
          type="button"
          onClick={() => navigate(ROUTES.FANTASY_CREATE_TEAM.replace(':matchId', matchId))}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Back to selection
        </button>
      </FantasyFlowShell>
    );
  }

  const rule = ctx.rule;
  const captain = selections.find((s) => s.isCaptain) ?? null;
  const viceCaptain = selections.find((s) => s.isViceCaptain) ?? null;
  const canSave = Boolean(validation?.isValid) && !ctx.isLocked && !isSubmitting;

  const captainPlayer = captain ? sortedPlayers.find((p) => p.id === captain.playerId) : null;
  const viceCaptainPlayer = viceCaptain
    ? sortedPlayers.find((p) => p.id === viceCaptain.playerId)
    : null;

  // ── Surface why Save is blocked ────────────────────────────────────
  // We don't just disable the button silently — that frustrates users.
  // Compute the first concrete blocker so we can either show it next to
  // the button or, on click, point the user at what to fix.
  const blockerLabel = ((): string | null => {
    if (ctx.isLocked) return 'Match locked';
    if (!captain) return 'Pick a captain';
    if (!viceCaptain) return 'Pick a vice-captain';
    if (validation && !validation.isValid) {
      const err = validation.issues.find((i) => i.severity === 'ERROR');
      return err?.message ?? 'Fix team errors';
    }
    return null;
  })();

  const onPreview = (): void =>
    void navigate(`${ROUTES.FANTASY_PREVIEW.replace(':matchId', matchId)}?draft=1`, {
      state: { selections, name: teamName },
    });

  return (
    <FantasyFlowShell withFooter>
        <FantasyMatchHeader
          context={ctx}
          title="Create Team"
          subtitle="Select Captain and Vice Captain"
          onBack={() => navigate(-1)}
          compact
        />

        {/* Current selections summary */}
        <div className="border-b border-border bg-surface px-3 py-3">
          <div className="grid grid-cols-2 gap-3">
            <CurrentSelection
              badge="C"
              multiplier={`${rule.captainMultiplier}x (double) points`}
              player={captainPlayer}
            />
            <CurrentSelection
              badge="VC"
              multiplier={`${rule.viceCaptainMultiplier}x points`}
              player={viceCaptainPlayer}
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border bg-surface px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FantasySortChip
            label="Type"
            active={sortKey === 'role'}
            icon={<ChevronDown className="h-3 w-3" />}
            onClick={() => setSortKey('role')}
          />
          <FantasySortChip label="Credits" active={sortKey === 'points'} onClick={() => setSortKey('points')} />
          <FantasySortChip
            label="% Captain"
            active={sortKey === 'captainPct'}
            onClick={() => setSortKey('captainPct')}
          />
          <FantasySortChip
            label="% Vice Captain"
            active={sortKey === 'viceCaptainPct'}
            onClick={() => setSortKey('viceCaptainPct')}
          />
        </div>

        <div className="grid grid-cols-[1fr_3.25rem_3.25rem] items-center gap-2 border-b border-border bg-surface-elevated px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-text-muted sm:grid-cols-[1fr_3.5rem_3.5rem]">
          <span className="pl-1">Player</span>
          <span className="text-center">% C</span>
          <span className="text-center">% VC</span>
        </div>

        <div className="flex-1 px-2 sm:px-3">
          {sortedPlayers.map((p) => {
            const sel = selections.find((s) => s.playerId === p.id);
            const captainPct =
              p.selectionPercent !== null ? `${(p.selectionPercent / 4).toFixed(2)}%` : '—';
            const viceCaptainPct =
              p.selectionPercent !== null ? `${(p.selectionPercent / 6).toFixed(2)}%` : '—';
            return (
              <CaptainListRow
                key={p.id}
                player={p}
                isCaptain={Boolean(sel?.isCaptain)}
                isViceCaptain={Boolean(sel?.isViceCaptain)}
                captainMultiplier={rule.captainMultiplier}
                viceCaptainMultiplier={rule.viceCaptainMultiplier}
                onSetCaptain={setCaptain}
                onSetViceCaptain={setViceCaptain}
                pointsValue={`${p.credits.toFixed(1)} cr`}
                captainPercent={captainPct}
                viceCaptainPercent={viceCaptainPct}
              />
            );
          })}
        </div>

        {/* Submission error or validation feedback — pinned above the action
            bar so the user always knows why Save isn't working. */}
        {(submitError || (validation && !validation.isValid && validation.issues.length > 0)) ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 flex justify-center px-3">
            <div className="pointer-events-auto w-full max-w-[380px]">
              {submitError ? (
                <div className="rounded-md bg-danger/10 px-3 py-2 text-xs font-semibold text-danger shadow">
                  {submitError}
                </div>
              ) : validation ? (
                <ValidationFeedback result={validation} maxIssues={1} />
              ) : null}
            </div>
          </div>
        ) : null}

        <FantasyStickyFooter>
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={onPreview} className={fantasyFooterBtn.ghost}>
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave}
              className={fantasyFooterBtn.primary}
              aria-disabled={!canSave}
              title={blockerLabel ?? 'Save team'}
            >
              {isSubmitting ? (
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : null}
              {canSave ? 'Save' : blockerLabel ?? 'Save'}
            </button>
          </div>
        </FantasyStickyFooter>
    </FantasyFlowShell>
  );
};

// ── Internal — single C/VC current selection card ──────────────────────
const CurrentSelection = ({
  badge,
  multiplier,
  player,
}: {
  badge: 'C' | 'VC';
  multiplier: string;
  player: FantasyMatchPlayer | null | undefined;
}): JSX.Element => {
  const accent =
    badge === 'C' ? 'bg-primary text-primary-foreground' : 'bg-text text-bg';
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-surface-elevated px-2.5 py-2 ring-1 ring-border">
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
          accent,
        )}
      >
        {badge}
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-text">
          {player ? player.shortName ?? player.name : `Pick a ${badge === 'C' ? 'captain' : 'vice-captain'}`}
        </div>
        <div className="text-[11px] text-text-muted">{multiplier}</div>
      </div>
    </div>
  );
};

export default CaptainSelectionScreen;
