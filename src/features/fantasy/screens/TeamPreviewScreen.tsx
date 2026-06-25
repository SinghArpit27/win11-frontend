import { Copy, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  Button,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Skeleton,
  Typography,
} from '@components/ui';
import { ROUTES } from '@constants/routes.constants';

import { FieldPreview, FantasyFlowShell, TeamPreviewHeader } from '../components';
import {
  useCloneFantasyTeamMutation,
  useDeleteFantasyTeamMutation,
  useGetFantasyMatchContextQuery,
  useGetMyFantasyTeamQuery,
} from '../fantasy.api';
import type { FantasyDraftSelection } from '../fantasy.types';

/**
 * Team preview screen — both the in-flight draft preview
 * (`?draft=1`) and the saved team detail (`/teams/:teamId`).
 *
 *  Visual reference (Dream11):
 *   - Dark `TeamPreviewHeader` showing team name, players counter,
 *     scoreboard, and credits left.
 *   - Full-bleed `FieldPreview` (cricket-field gradient) with players
 *     grouped into role bands.
 *   - When viewing a saved team, render the Edit / Clone / Delete row
 *     under the field. When previewing a draft, render a "Start
 *     Selecting" CTA inside the empty state instead.
 */

interface LocationState {
  selections?: FantasyDraftSelection[];
  name?: string;
}

const TeamPreviewScreen = (): JSX.Element => {
  const { matchId = '', teamId } = useParams<{ matchId: string; teamId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isDraftMode = searchParams.get('draft') === '1';
  const navState = (location.state ?? {}) as LocationState;

  const ctxQuery = useGetFantasyMatchContextQuery({ matchId }, { skip: !matchId });
  const teamQuery = useGetMyFantasyTeamQuery(
    { teamId: teamId ?? '' },
    { skip: !teamId || isDraftMode },
  );

  const [cloneTeam, cloneState] = useCloneFantasyTeamMutation();
  const [deleteTeam, deleteState] = useDeleteFantasyTeamMutation();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const ctx = ctxQuery.data;
  const rule = ctx?.rule ?? null;

  // Build a uniform selection list regardless of source.
  const selections: FantasyDraftSelection[] = useMemo(() => {
    if (isDraftMode && navState.selections) return navState.selections;
    if (teamQuery.data) {
      return teamQuery.data.players.map((p) => ({
        playerId: p.playerId,
        isCaptain: p.isCaptain,
        isViceCaptain: p.isViceCaptain,
      }));
    }
    return [];
  }, [isDraftMode, navState.selections, teamQuery.data]);

  const teamName =
    (isDraftMode ? navState.name : teamQuery.data?.name) ?? 'Preview team';

  const players = useMemo(() => {
    if (!ctx) return [];
    const idx = new Map(ctx.players.map((p) => [p.id, p]));
    return selections
      .map((sel) => {
        const player = idx.get(sel.playerId);
        if (!player) return null;
        return { player, isCaptain: sel.isCaptain, isViceCaptain: sel.isViceCaptain };
      })
      .filter(
        (p): p is { player: NonNullable<typeof p>['player']; isCaptain: boolean; isViceCaptain: boolean } =>
          p !== null,
      );
  }, [ctx, selections]);

  const creditsUsed = useMemo(
    () => players.reduce((sum, p) => sum + p.player.credits, 0),
    [players],
  );

  if (ctxQuery.isLoading || (teamId && teamQuery.isLoading && !isDraftMode)) {
    return (
      <FantasyFlowShell>
        <Skeleton className="h-16 w-full rounded-none" />
        <Skeleton className="h-[480px] w-full rounded-none" />
      </FantasyFlowShell>
    );
  }
  if (!ctx || !rule) {
    return (
      <FantasyFlowShell className="items-center justify-center px-6 py-12 text-center">
        <Typography variant="h3">Nothing to preview</Typography>
        <Typography variant="caption" tone="muted">
          Pick your players first, then come back here to preview the lineup.
        </Typography>
        <Button
          variant="primary"
          onClick={() => navigate(ROUTES.FANTASY_CREATE_TEAM.replace(':matchId', matchId))}
        >
          Start selecting
        </Button>
      </FantasyFlowShell>
    );
  }

  const matchLocked = ctx.isLocked;
  const creditsLeft = rule.creditBudget - creditsUsed;

  const onClone = async (): Promise<void> => {
    if (!teamId) return;
    try {
      const newTeam = await cloneTeam({ teamId, matchId }).unwrap();
      navigate(
        ROUTES.FANTASY_TEAM_DETAIL.replace(':matchId', matchId).replace(':teamId', newTeam.id),
      );
    } catch {
      /* swallow — UI stays on the preview */
    }
  };

  const onDelete = async (): Promise<void> => {
    if (!teamId) return;
    try {
      await deleteTeam({ teamId, matchId }).unwrap();
      navigate(ROUTES.FANTASY_MY_TEAMS.replace(':matchId', matchId));
    } catch {
      setConfirmDelete(false);
    }
  };

  return (
    <FantasyFlowShell>
        <TeamPreviewHeader
          context={ctx}
          teamName={teamName}
          selected={players.length}
          required={rule.teamSize}
          creditsLeft={creditsLeft}
          onClose={() => navigate(-1)}
        />

        {/* Field surface — full-bleed, occupies the remaining vertical
            space minus the optional action row */}
        <FieldPreview
          className="flex-1"
          players={players}
          emptyAction={
            <button
              type="button"
              onClick={() =>
                navigate(ROUTES.FANTASY_CREATE_TEAM.replace(':matchId', matchId))
              }
              className="rounded-md bg-surface px-4 py-2 text-xs font-bold uppercase tracking-wider text-text shadow-md ring-1 ring-border hover:bg-surface-hover"
            >
              Start Selecting
            </button>
          }
        />

        {/* Action row — only on saved team detail */}
        {!isDraftMode && teamId ? (
          <div className="sticky bottom-0 z-30 flex items-center justify-end gap-1.5 border-t border-border bg-surface/95 px-3 py-2.5 safe-pb backdrop-blur-md">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() =>
                navigate(
                  `${ROUTES.FANTASY_CREATE_TEAM.replace(':matchId', matchId)}?editTeamId=${teamId}`,
                )
              }
              disabled={matchLocked}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Copy className="h-4 w-4" />}
              onClick={onClone}
              disabled={matchLocked}
              loading={cloneState.isLoading}
            >
              Clone
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setConfirmDelete(true)}
              disabled={matchLocked}
            >
              Delete
            </Button>
          </div>
        ) : null}

        <Modal open={confirmDelete} onOpenChange={setConfirmDelete}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Delete team?</ModalTitle>
              <ModalDescription>
                This will permanently remove this fantasy team. You can re-create it from scratch later.
              </ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={onDelete} loading={deleteState.isLoading}>
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </FantasyFlowShell>
  );
};

export default TeamPreviewScreen;
