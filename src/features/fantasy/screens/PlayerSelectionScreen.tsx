import { ChevronDown, Eye } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import type { PlayerRole } from '@shared/enums';
import { cn } from '@utils/cn';

import {
  FantasyFlowShell,
  FantasyMatchHeader,
  FantasyStickyFooter,
  PlayerListRow,
  RoleTabs,
  StatsTabs,
  type StatsTabItem,
  ValidationFeedback,
  fantasyFooterBtn,
} from '../components';
import {
  useGetFantasyMatchContextQuery,
  useGetMyFantasyTeamQuery,
  useListMyFantasyTeamsQuery,
} from '../fantasy.api';
import type { FantasyDraftSelection, FantasyMatchPlayer, FantasyRule } from '../fantasy.types';
import { useFantasyDraft, useFantasyValidation } from '../hooks';

/**
 * Step 1 of the create-team flow — Dream11-style player picker.
 *
 *  Layout:
 *   - Dark gradient `FantasyMatchHeader` with countdown, score, dot
 *     progress, and a clear-selection X on the right.
 *   - Sport-aware `RoleTabs` strip directly below the header.
 *   - Two-column player list split by team — left column = home team,
 *     right column = away team. Each row uses `PlayerListRow`.
 *   - Sticky `FantasyPillActionBar` pinned to the safe-area bottom with
 *     two ghost actions (`PREVIEW`, `PAST LINEUP`) and a primary CTA
 *     (`NEXT` or `Choose Captain`).
 */
const PlayerSelectionScreen = (): JSX.Element => {
  const { matchId = '' } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editTeamId = params.get('editTeamId');
  const cloneTeamId = params.get('cloneTeamId');

  const ctxQuery = useGetFantasyMatchContextQuery({ matchId }, { skip: !matchId });
  const teamsQuery = useListMyFantasyTeamsQuery(
    { matchId, page: 1, limit: 50 },
    { skip: !matchId },
  );

  // Edit / clone seed
  const seedTeamQuery = useGetMyFantasyTeamQuery(
    { teamId: (editTeamId ?? cloneTeamId) ?? '' },
    { skip: !editTeamId && !cloneTeamId },
  );

  const seedSelections = useMemo<FantasyDraftSelection[] | undefined>(() => {
    if (!seedTeamQuery.data) return undefined;
    return seedTeamQuery.data.players.map((p) => ({
      playerId: p.playerId,
      isCaptain: p.isCaptain,
      isViceCaptain: p.isViceCaptain,
    }));
  }, [seedTeamQuery.data]);

  const draft = useFantasyDraft({
    matchId,
    clientDraftId: editTeamId
      ? `edit-${editTeamId}`
      : cloneTeamId
        ? `clone-${cloneTeamId}`
        : null,
    initialSelections: seedSelections,
    initialName: seedTeamQuery.data?.name,
    enabled: Boolean(matchId),
  });

  const ctx = ctxQuery.data;
  const rule = ctx?.rule ?? null;

  const validation = useFantasyValidation({
    rule,
    selections: draft.selections,
    playerCatalogue: ctx?.players,
    matchLocked: ctx?.isLocked,
    existingTeamCount: teamsQuery.data?.meta?.total ?? teamsQuery.data?.items.length,
    isEdit: Boolean(editTeamId),
  });

  // ── Filters ─────────────────────────────────────────────────────────
  const [activeRole, setActiveRole] = useState<PlayerRole | 'ALL'>('ALL');

  // ── Derived: split by team for the two-column grid ──────────────────
  const { home, away, homePlayers, awayPlayers } = useMemo(() => {
    if (!ctx?.match || !ctx.players) {
      return { home: null, away: null, homePlayers: [], awayPlayers: [] };
    }
    const homeId = ctx.match.homeTeam.id;
    const awayId = ctx.match.awayTeam.id;
    const homeSide: FantasyMatchPlayer[] = [];
    const awaySide: FantasyMatchPlayer[] = [];
    for (const p of ctx.players) {
      if (activeRole !== 'ALL' && p.role !== activeRole) continue;
      if (p.team?.id === homeId) homeSide.push(p);
      else if (p.team?.id === awayId) awaySide.push(p);
    }
    return {
      home: ctx.match.homeTeam,
      away: ctx.match.awayTeam,
      homePlayers: homeSide,
      awayPlayers: awaySide,
    };
  }, [ctx?.match, ctx?.players, activeRole]);

  const selectionByRole = validation?.summary.roleBreakdown ?? {};
  const selectionByTeam = validation?.summary.teamBreakdown ?? {};
  const creditsUsed = validation?.summary.creditsUsed ?? 0;

  const canProceed = Boolean(
    rule &&
      validation &&
      validation.summary.playersSelected === rule.teamSize &&
      creditsUsed <= rule.creditBudget &&
      !validation.issues.some(
        (i) =>
          i.severity === 'ERROR' &&
          ![
            'CAPTAIN_NOT_SELECTED',
            'VICE_CAPTAIN_NOT_SELECTED',
            'CAPTAIN_VICE_CAPTAIN_SAME',
          ].includes(i.code),
      ),
  );

  // ── Loading / error fallbacks ──────────────────────────────────────
  if (!matchId) {
    return (
      <div className="px-4 py-6">
        <Typography variant="h3">Missing match</Typography>
      </div>
    );
  }
  if (ctxQuery.isLoading || (seedTeamQuery.isFetching && (editTeamId || cloneTeamId))) {
    return (
      <FantasyFlowShell>
        <Skeleton className="h-24 w-full rounded-none" />
        <Skeleton className="h-10 w-2/3" />
        <div className="flex flex-col gap-2 p-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      </FantasyFlowShell>
    );
  }
  if (ctxQuery.isError || !ctx || !rule) {
    // Surface as much actionable detail as possible: matchId, the API
    // error code (e.g. `MATCH_NOT_FOUND`, `FANTASY_RULES_NOT_CONFIGURED`),
    // and the sport/format when the context loaded but the rule didn't.
    const err = ctxQuery.error as
      | { status?: number; data?: { code?: string; message?: string } }
      | undefined;
    const apiCode = err?.data?.code ?? null;
    const apiMessage = err?.data?.message ?? null;
    const sportFormat = ctx ? `${ctx.sport} / ${ctx.format}` : null;
    const isMissingMatch = err?.status === 404 || apiCode === 'MATCH_NOT_FOUND';
    const isMissingRule = !!ctx && !rule;

    const heading = isMissingMatch
      ? 'Match not found'
      : isMissingRule
        ? 'Fantasy rules not configured'
        : 'Fantasy not available';
    const body = isMissingMatch
      ? `We couldn’t find a match with id ${matchId}.`
      : isMissingRule
        ? `No active fantasy rule for ${sportFormat ?? 'this match'}. An admin must seed or activate a rule before users can build teams.`
        : (apiMessage ?? 'This match isn’t configured for fantasy yet.');

    return (
      <FantasyFlowShell className="items-center justify-center px-6 py-12 text-center">
        <Typography variant="h3">{heading}</Typography>
        <Typography variant="caption" tone="muted">
          {body}
        </Typography>
        {apiCode ? (
          <code className="rounded bg-surface-elevated px-2 py-1 text-[10px] font-mono text-text-muted">
            {apiCode}
          </code>
        ) : null}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.MATCH_DETAIL.replace(':matchId', matchId))}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Match details
          </button>
        </div>
      </FantasyFlowShell>
    );
  }

  const matchLocked = ctx.isLocked;
  const totalSelected = validation?.summary.playersSelected ?? 0;

  const onNext = (): void => {
    const queryString = editTeamId
      ? `?editTeamId=${editTeamId}`
      : cloneTeamId
        ? `?cloneTeamId=${cloneTeamId}`
        : '';
    navigate(`${ROUTES.FANTASY_CAPTAINS.replace(':matchId', matchId)}${queryString}`, {
      state: { selections: draft.selections, name: draft.name },
    });
  };

  const statsItems: StatsTabItem[] = [
    ctx.match?.venue?.name ? { id: 'venue', label: `Venue: ${ctx.match.venue.name}` } : null,
    ctx.match?.tournament?.shortName
      ? { id: 'tour', label: ctx.match.tournament.shortName }
      : null,
    ctx.format ? { id: 'format', label: `Format: ${ctx.format}` } : null,
  ].filter((s): s is StatsTabItem => s !== null);

  const onPreview = (): void =>
    void navigate(`${ROUTES.FANTASY_PREVIEW.replace(':matchId', matchId)}?draft=1`, {
      state: { selections: draft.selections, name: draft.name },
    });

  return (
    <FantasyFlowShell withFooter>
        <FantasyMatchHeader
          context={ctx}
          title="Create Team"
          onBack={() => navigate(-1)}
          selectedCount={totalSelected}
          requiredCount={rule.teamSize}
          onClearSelection={draft.selections.length > 0 ? draft.clearSelections : undefined}
        />

        <StatsTabs items={statsItems} />

        <RoleTabs
          active={activeRole}
          onChange={setActiveRole}
          constraints={rule.roleConstraints}
          selectionByRole={selectionByRole}
          totalSelected={totalSelected}
          totalRequired={rule.teamSize}
          className="sticky top-0 z-20 bg-surface"
        />

        {home && away ? (
          <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
            <TeamFlagHeader team={home} align="start" />
            <button
              type="button"
              className="flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-3 py-1 text-[11px] font-semibold text-text"
              aria-label="Sort by"
            >
              Credits <ChevronDown className="h-3 w-3" />
            </button>
            <TeamFlagHeader team={away} align="end" />
          </div>
        ) : null}

        <div className="grid grid-cols-[1fr_24px_1fr] items-center border-b border-border bg-surface px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted sm:px-3">
          <div className="flex items-center justify-between pr-1">
            <span>sel by</span>
            <span>cr</span>
          </div>
          <span />
          <div className="flex items-center justify-between pl-1">
            <span>sel by</span>
            <span>cr</span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-[1fr_24px_1fr] bg-surface px-1 sm:px-2">
          <PlayerColumn
            players={homePlayers}
            draft={draft}
            selectionByRole={selectionByRole}
            selectionByTeam={selectionByTeam}
            rule={rule}
            creditsUsed={creditsUsed}
            totalSelected={totalSelected}
            matchLocked={matchLocked}
            align="left"
          />
          <RankGutter length={Math.max(homePlayers.length, awayPlayers.length)} />
          <PlayerColumn
            players={awayPlayers}
            draft={draft}
            selectionByRole={selectionByRole}
            selectionByTeam={selectionByTeam}
            rule={rule}
            creditsUsed={creditsUsed}
            totalSelected={totalSelected}
            matchLocked={matchLocked}
            align="right"
          />
        </div>

        {validation && !validation.isValid && validation.issues.length > 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-20 z-30 flex justify-center px-3">
            <div className="pointer-events-auto w-full max-w-[380px]">
              <ValidationFeedback result={validation} maxIssues={1} />
            </div>
          </div>
        ) : null}

        <FantasyStickyFooter>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onPreview}
              disabled={draft.selections.length === 0}
              className={fantasyFooterBtn.ghost}
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canProceed || matchLocked}
              className={fantasyFooterBtn.primary}
            >
              Next
            </button>
          </div>
        </FantasyStickyFooter>
    </FantasyFlowShell>
  );
};

// ── Internal — column header (team flag + short name) ──────────────────
const TeamFlagHeader = ({
  team,
  align,
}: {
  team: { shortName: string; logoUrl: string | null; primaryColor: string | null };
  align: 'start' | 'end';
}): JSX.Element => (
  <div
    className={cn(
      'flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-text',
      align === 'end' && 'flex-row-reverse',
    )}
  >
    <div
      className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full ring-1 ring-border"
      style={{ backgroundColor: team.primaryColor ?? '#444' }}
      aria-hidden
    >
      {team.logoUrl ? (
        <img src={team.logoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="text-[7px] font-bold text-white">{team.shortName.slice(0, 2)}</span>
      )}
    </div>
    <span>{team.shortName}</span>
  </div>
);

// ── Internal — vertical rank column rendered between the two player columns ──
const RankGutter = ({ length }: { length: number }): JSX.Element => (
  <ul className="flex flex-col items-center" aria-hidden>
    {Array.from({ length }).map((_, idx) => (
      <li
        key={idx}
        className="flex h-[72px] w-full items-center justify-center text-[10px] font-bold tabular-nums text-text-muted"
      >
        {idx + 1}
      </li>
    ))}
  </ul>
);

// ── Internal — one column of players ───────────────────────────────────
interface PlayerColumnProps {
  players: FantasyMatchPlayer[];
  draft: ReturnType<typeof useFantasyDraft>;
  selectionByRole: Record<string, number>;
  selectionByTeam: Record<string, number>;
  rule: FantasyRule;
  creditsUsed: number;
  totalSelected: number;
  matchLocked: boolean;
  align: 'left' | 'right';
}

const PlayerColumn = ({
  players,
  draft,
  selectionByRole,
  selectionByTeam,
  rule,
  creditsUsed,
  totalSelected,
  matchLocked,
  align,
}: PlayerColumnProps): JSX.Element => {
  if (players.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-text-muted">
        No players
      </div>
    );
  }
  return (
    <ul>
      {players.map((p) => {
        const selection = draft.selections.find((s) => s.playerId === p.id);
        const isSelected = Boolean(selection);
        const teamCount = p.team ? selectionByTeam[p.team.id] ?? 0 : 0;
        const roleCount = selectionByRole[p.role] ?? 0;
        const roleCap = rule.roleConstraints.find((c) => c.role === p.role)?.max ?? rule.teamSize;
        const wouldExceedCredits = !isSelected && creditsUsed + p.credits > rule.creditBudget;
        const wouldExceedRole = !isSelected && roleCount >= roleCap;
        const wouldExceedTeam = !isSelected && teamCount >= rule.maxFromSingleTeam;
        const sizeAtCap = totalSelected >= rule.teamSize;
        const disabled =
          matchLocked ||
          (!isSelected && (sizeAtCap || wouldExceedRole || wouldExceedTeam || wouldExceedCredits));
        return (
          <li key={p.id} className="min-h-[72px]">
            <PlayerListRow
              player={p}
              isSelected={isSelected}
              onToggle={draft.toggleSelection}
              disabled={disabled}
              align={align}
              className="h-full"
              secondaryValue={
                /* Phase 5 ships without per-match points — show base credits as the right-side stat */
                `${p.credits.toFixed(1)}`
              }
              captainBadge={
                selection?.isCaptain ? 'C' : selection?.isViceCaptain ? 'VC' : null
              }
            />
          </li>
        );
      })}
    </ul>
  );
};

export default PlayerSelectionScreen;
