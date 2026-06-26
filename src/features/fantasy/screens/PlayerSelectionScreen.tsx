import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Skeleton, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import type { PlayerRole } from '@shared/enums';
import { cn } from '@utils/cn';

import {
  FantasyCreateTeamFooter,
  FantasyFlowShell,
  FantasyMatchHeader,
  PlayerListRow,
  RoleTabs,
  SquadListHeader,
  StatsTabs,
} from '../components';
import { CREATE_TEAM_COLORS, CREATE_TEAM_LAYOUT } from '../fantasy.create-team.tokens';
import {
  useGetFantasyMatchContextQuery,
  useGetMyFantasyTeamQuery,
  useListMyFantasyTeamsQuery,
} from '../fantasy.api';
import type { FantasyDraftSelection, FantasyMatchPlayer, FantasyRule } from '../fantasy.types';
import { buildFantasyMatchStats, isPlayerPickDisabled, sortFantasyPlayers } from '../fantasy.utils';
import { useFantasyDraft, useFantasyValidation } from '../hooks';

/**
 * Step 1 of the create-team flow — Dream11-style player picker.
 *
 * Uses the global `AppTopBar` (same as Home) plus a dark match header,
 * stats strip, role tabs, and a two-column squad split for every tab.
 */
const PlayerSelectionScreen = (): JSX.Element => {
  const { matchId = '' } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editTeamId = params.get('editTeamId');
  const cloneTeamId = params.get('cloneTeamId');
  const contestId = params.get('contestId');

  const ctxQuery = useGetFantasyMatchContextQuery({ matchId }, { skip: !matchId });
  const teamsQuery = useListMyFantasyTeamsQuery(
    { matchId, page: 1, limit: 50 },
    { skip: !matchId },
  );

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

  const [activeRole, setActiveRole] = useState<PlayerRole | 'ALL'>('ALL');
  const [creditsDesc, setCreditsDesc] = useState(true);

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
    const direction = creditsDesc ? 'desc' : 'asc';
    return {
      home: ctx.match.homeTeam,
      away: ctx.match.awayTeam,
      homePlayers: sortFantasyPlayers(homeSide, 'credits', direction),
      awayPlayers: sortFantasyPlayers(awaySide, 'credits', direction),
    };
  }, [ctx?.match, ctx?.players, activeRole, creditsDesc]);

  const selectionByRole = validation?.summary.roleBreakdown ?? {};
  const selectionByTeam = validation?.summary.teamBreakdown ?? {};
  const creditsUsed = validation?.summary.creditsUsed ?? 0;

  const homePickCount = home ? selectionByTeam[home.id] ?? 0 : 0;
  const awayPickCount = away ? selectionByTeam[away.id] ?? 0 : 0;

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
    const query = new URLSearchParams();
    if (editTeamId) query.set('editTeamId', editTeamId);
    else if (cloneTeamId) query.set('cloneTeamId', cloneTeamId);
    if (contestId) query.set('contestId', contestId);
    const queryString = query.toString();
    navigate(
      `${ROUTES.FANTASY_CAPTAINS.replace(':matchId', matchId)}${queryString ? `?${queryString}` : ''}`,
      { state: { selections: draft.selections, name: draft.name } },
    );
  };

  const statsItems = buildFantasyMatchStats(ctx);

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
        homePickCount={homePickCount}
        awayPickCount={awayPickCount}
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
        className="sticky top-0 z-20 bg-[#ffffff]"
      />

      {home && away ? (
        <SquadListHeader
          creditsDesc={creditsDesc}
          onToggleCreditsSort={() => setCreditsDesc((prev) => !prev)}
          homeLabel={<TeamFlagHeader team={home} align="start" />}
          awayLabel={<TeamFlagHeader team={away} align="end" />}
        />
      ) : null}

      <div
        className="min-h-0 flex-1 overflow-y-auto pt-4"
        style={{ backgroundColor: CREATE_TEAM_COLORS.white }}
      >
        {Array.from({ length: Math.max(homePlayers.length, awayPlayers.length) }).map(
          (_, rowIdx) => (
            <div
              key={rowIdx}
              className="grid min-w-0 grid-cols-2 divide-x divide-dashed divide-[#d8d8d8]"
            >
              <PlayerCell
                player={homePlayers[rowIdx]}
                draft={draft}
                selectionByRole={selectionByRole}
                selectionByTeam={selectionByTeam}
                rule={rule}
                creditsUsed={creditsUsed}
                totalSelected={totalSelected}
                matchLocked={matchLocked}
              />
              <PlayerCell
                player={awayPlayers[rowIdx]}
                draft={draft}
                selectionByRole={selectionByRole}
                selectionByTeam={selectionByTeam}
                rule={rule}
                creditsUsed={creditsUsed}
                totalSelected={totalSelected}
                matchLocked={matchLocked}
              />
            </div>
          ),
        )}
      </div>

      <p
        className="shrink-0 border-t px-3 py-2 text-[9px] leading-snug text-[#9e9e9e]"
        style={{
          backgroundColor: CREATE_TEAM_COLORS.white,
          borderColor: CREATE_TEAM_COLORS.divider,
        }}
      >
        *For information purposes only. User discretion is advised. Batting order is subject to
        change in the real match.
      </p>

      <FantasyCreateTeamFooter
        onPreview={onPreview}
        onNext={onNext}
        previewDisabled={draft.selections.length === 0}
        nextDisabled={!canProceed || matchLocked}
      />
    </FantasyFlowShell>
  );
};

const TeamFlagHeader = ({
  team,
  align,
}: {
  team: { shortName: string; logoUrl: string | null; primaryColor: string | null };
  align: 'start' | 'end';
}): JSX.Element => (
  <div
    className={cn(
      'flex items-center gap-1 font-bold uppercase tracking-wide',
      align === 'end' && 'flex-row-reverse',
    )}
    style={{
      fontSize: CREATE_TEAM_LAYOUT.teamLabelFontPx,
      color: CREATE_TEAM_COLORS.nameText,
    }}
  >
    <div
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{
        backgroundColor: team.primaryColor ?? '#444',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
      }}
      aria-hidden
    >
      {team.logoUrl ? (
        <img src={team.logoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="text-[8px] font-bold text-white">{team.shortName.slice(0, 2)}</span>
      )}
    </div>
    <span>{team.shortName}</span>
  </div>
);

interface PlayerCellProps {
  player?: FantasyMatchPlayer;
  draft: ReturnType<typeof useFantasyDraft>;
  selectionByRole: Record<string, number>;
  selectionByTeam: Record<string, number>;
  rule: FantasyRule;
  creditsUsed: number;
  totalSelected: number;
  matchLocked: boolean;
}

const PlayerCell = ({
  player,
  draft,
  selectionByRole,
  selectionByTeam,
  rule,
  creditsUsed,
  totalSelected,
  matchLocked,
}: PlayerCellProps): JSX.Element => {
  if (!player) {
    return <div style={{ minHeight: CREATE_TEAM_LAYOUT.rowMinHeightPx, backgroundColor: CREATE_TEAM_COLORS.white }} aria-hidden />;
  }

  const selection = draft.selections.find((s) => s.playerId === player.id);
  const isSelected = Boolean(selection);
  const teamCount = player.team ? selectionByTeam[player.team.id] ?? 0 : 0;
  const roleCount = selectionByRole[player.role] ?? 0;
  const roleCap = rule.roleConstraints.find((c) => c.role === player.role)?.max ?? rule.teamSize;
  const disabled = isPlayerPickDisabled(player, {
    isSelected,
    matchLocked,
    creditsUsed,
    creditBudget: rule.creditBudget,
    roleCount,
    roleCap,
    teamCount,
    maxFromSingleTeam: rule.maxFromSingleTeam,
    totalSelected,
    teamSize: rule.teamSize,
  });

  return (
    <PlayerListRow
      player={player}
      isSelected={isSelected}
      onToggle={draft.toggleSelection}
      disabled={disabled}
      captainBadge={selection?.isCaptain ? 'C' : selection?.isViceCaptain ? 'VC' : null}
    />
  );
};

export default PlayerSelectionScreen;
