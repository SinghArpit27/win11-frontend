import { useMemo, useState } from 'react';

import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Typography,
} from '@components/ui';
import { useListUpcomingMatchesQuery } from '@features/sports/sports.api';
import { extractErrorMessage } from '@utils/errors';
import { cn } from '@utils/cn';

import { useAdminCreateContestsFromTemplateMutation } from '../../contest.api';
import { formatMatchLabel } from '../../admin.contest.utils';
import type { ContestTemplate } from '../../contest.types';

interface AdminAttachTemplateModalProps {
  open: boolean;
  template: ContestTemplate | null;
  attachedMatchIds?: ReadonlySet<string>;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (created: number, skipped: number) => void;
}

export const AdminAttachTemplateModal = ({
  open,
  template,
  attachedMatchIds,
  onOpenChange,
  onSuccess,
}: AdminAttachTemplateModalProps): JSX.Element => {
  const [selected, setSelected] = useState<string[]>([]);
  const [publishImmediately, setPublishImmediately] = useState(true);
  const matchesQuery = useListUpcomingMatchesQuery(undefined, { skip: !open });
  const [attach, attachState] = useAdminCreateContestsFromTemplateMutation();

  const matches = matchesQuery.data ?? [];

  const selectableMatches = useMemo(
    () =>
      matches.filter((m) => !attachedMatchIds?.has(m.id)),
    [matches, attachedMatchIds],
  );

  const toggle = (matchId: string): void => {
    setSelected((prev) =>
      prev.includes(matchId) ? prev.filter((id) => id !== matchId) : [...prev, matchId],
    );
  };

  const selectAll = (): void => {
    setSelected(selectableMatches.map((m) => m.id));
  };

  const clearAll = (): void => {
    setSelected([]);
  };

  const handleAttach = async (): Promise<void> => {
    if (!template || selected.length === 0) return;
    try {
      const result = await attach({
        templateId: template.id,
        matchIds: selected,
        publishImmediately,
        skipExisting: true,
      }).unwrap();
      onOpenChange(false);
      setSelected([]);
      onSuccess?.(result.items.length, result.skippedMatchIds.length);
    } catch {
      // error shown below
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSelected([]);
          attachState.reset();
        }
        onOpenChange(next);
      }}
    >
      <ModalContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <ModalHeader>
          <ModalTitle>Attach template to matches</ModalTitle>
          {template ? (
            <Typography variant="caption" tone="muted" className="block">
              {template.name}
            </Typography>
          ) : null}
        </ModalHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Typography variant="caption" tone="muted">
              Select upcoming matches
            </Typography>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                Select all
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearAll}>
                Clear
              </Button>
            </div>
          </div>

          {matchesQuery.isLoading ? (
            <Typography variant="body" tone="muted">
              Loading matches…
            </Typography>
          ) : selectableMatches.length === 0 ? (
            <Typography variant="body" tone="muted">
              No upcoming matches available (or all already have this template).
            </Typography>
          ) : (
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
              {selectableMatches.map((match) => {
                const checked = selected.includes(match.id);
                return (
                  <li key={match.id}>
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm',
                        checked ? 'bg-primary/10' : 'hover:bg-surface-hover',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(match.id)}
                      />
                      <span className="font-medium">{formatMatchLabel(match)}</span>
                      <span className="ml-auto text-xs text-text-muted">
                        {new Date(match.scheduledAt).toLocaleDateString('en-IN')}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={publishImmediately}
              onChange={(e) => setPublishImmediately(e.target.checked)}
            />
            Publish immediately (OPEN status)
          </label>

          {attachState.error ? (
            <p className="text-sm text-danger">{extractErrorMessage(attachState.error)}</p>
          ) : null}
        </div>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!template || selected.length === 0 || attachState.isLoading}
            onClick={() => void handleAttach()}
          >
            Attach to {selected.length || 0} match{selected.length === 1 ? '' : 'es'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
