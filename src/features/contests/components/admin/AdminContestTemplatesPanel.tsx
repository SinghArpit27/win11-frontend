import { Link2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge, Button, Card, Skeleton, Typography } from '@components/ui';
import { useListMatchesQuery } from '@features/sports/sports.api';
import { formatMoney } from '@features/wallet/wallet.utils';
import { cn } from '@utils/cn';
import { extractErrorMessage } from '@utils/errors';

import {
  useAdminDeleteTemplateMutation,
  useAdminListContestsQuery,
  useAdminListTemplatesQuery,
} from '../../contest.api';
import { TYPE_META } from '../../contest.utils';
import { buildMatchMap, groupContestsByTemplate } from '../../admin.contest.utils';
import type { ContestTemplate } from '../../contest.types';
import { AdminAttachTemplateModal } from './AdminAttachTemplateModal';
import { AdminTemplateFormModal } from './AdminTemplateFormModal';

interface AdminContestTemplatesPanelProps {
  onAttachSuccess?: (message: string) => void;
}

export const AdminContestTemplatesPanel = ({
  onAttachSuccess,
}: AdminContestTemplatesPanelProps): JSX.Element => {
  const [formOpen, setFormOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [editing, setEditing] = useState<ContestTemplate | null>(null);
  const [attaching, setAttaching] = useState<ContestTemplate | null>(null);

  const templatesQuery = useAdminListTemplatesQuery({ limit: 100, isActive: undefined });
  const contestsQuery = useAdminListContestsQuery({ limit: 500 });
  const matchesQuery = useListMatchesQuery({ limit: 200 });
  const [deleteTemplate, deleteState] = useAdminDeleteTemplateMutation();

  const templates = templatesQuery.data?.items ?? [];
  const matchMap = useMemo(
    () => buildMatchMap(matchesQuery.data?.items ?? []),
    [matchesQuery.data],
  );
  const attachedByTemplate = useMemo(
    () => groupContestsByTemplate(contestsQuery.data?.items ?? [], matchMap),
    [contestsQuery.data, matchMap],
  );

  const attachedMatchIdsFor = (templateId: string): ReadonlySet<string> => {
    const rows = attachedByTemplate.get(templateId) ?? [];
    return new Set(rows.map((r) => r.matchId));
  };

  const openCreate = (): void => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (template: ContestTemplate): void => {
    setEditing(template);
    setFormOpen(true);
  };

  const openAttach = (template: ContestTemplate): void => {
    setAttaching(template);
    setAttachOpen(true);
  };

  const handleDelete = async (template: ContestTemplate): Promise<void> => {
    if (!window.confirm(`Deactivate template "${template.name}"?`)) return;
    try {
      await deleteTemplate({ templateId: template.id }).unwrap();
    } catch {
      // error in deleteState
    }
  };

  const loading = templatesQuery.isLoading || contestsQuery.isLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h3" className="block text-base font-bold">
            Contest templates
          </Typography>
          <Typography variant="caption" tone="muted">
            Reusable blueprints — attach to any match or create custom contests.
          </Typography>
        </div>
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus className="mr-1 h-4 w-4" />
          New template
        </Button>
      </div>

      {deleteState.error ? (
        <p className="text-sm text-danger">{extractErrorMessage(deleteState.error)}</p>
      ) : null}

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : templates.length === 0 ? (
        <Card padding="xl" className="border-dashed text-center">
          <Typography variant="body" tone="muted">
            No templates yet. Create one or restart the backend to seed defaults.
          </Typography>
        </Card>
      ) : (
        <Card padding="none" className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-bg-elevated/60 text-[11px] uppercase tracking-wider text-text-muted">
              <tr>
                <Th>Template</Th>
                <Th>Type</Th>
                <Th className="text-right">Entry</Th>
                <Th className="text-right">Pool</Th>
                <Th className="text-right">Spots</Th>
                <Th>Attached matches</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => {
                const attached = attachedByTemplate.get(template.id) ?? [];
                const typeMeta = TYPE_META[template.type];
                return (
                  <tr
                    key={template.id}
                    className="border-t border-border transition-colors hover:bg-surface-hover"
                  >
                    <Td>
                      <p className="font-semibold">{template.name}</p>
                      {template.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-text-muted">
                          {template.description}
                        </p>
                      ) : null}
                    </Td>
                    <Td>
                      <span className={cn('text-xs font-bold uppercase', typeMeta.accent)}>
                        {typeMeta.label}
                      </span>
                    </Td>
                    <Td className="text-right tabular-nums">
                      {formatMoney(template.entryFee, { currency: template.currency })}
                    </Td>
                    <Td className="text-right tabular-nums">
                      {formatMoney(template.prizePoolAmount, { currency: template.currency })}
                    </Td>
                    <Td className="text-right tabular-nums">
                      {template.totalSpots.toLocaleString('en-IN')}
                    </Td>
                    <Td>
                      {attached.length === 0 ? (
                        <span className="text-xs text-text-muted">Not attached</span>
                      ) : (
                        <div className="flex max-w-xs flex-wrap gap-1">
                          {attached.slice(0, 4).map((row) => (
                            <Badge key={row.contestId} tone="neutral" className="text-[10px]">
                              {row.label}
                            </Badge>
                          ))}
                          {attached.length > 4 ? (
                            <Badge tone="neutral" className="text-[10px]">
                              +{attached.length - 4} more
                            </Badge>
                          ) : null}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <Badge tone={template.isActive ? 'success' : 'neutral'} className="text-[10px]">
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Attach to matches"
                          onClick={() => openAttach(template)}
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Edit template"
                          onClick={() => openEdit(template)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Delete template"
                          disabled={deleteState.isLoading}
                          onClick={() => void handleDelete(template)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <AdminTemplateFormModal
        open={formOpen}
        template={editing}
        onOpenChange={setFormOpen}
      />
      <AdminAttachTemplateModal
        open={attachOpen}
        template={attaching}
        attachedMatchIds={attaching ? attachedMatchIdsFor(attaching.id) : undefined}
        onOpenChange={setAttachOpen}
        onSuccess={(created, skipped) => {
          onAttachSuccess?.(
            created > 0
              ? `Attached ${created} contest${created === 1 ? '' : 's'}${skipped ? ` (${skipped} skipped — already attached)` : ''}.`
              : skipped > 0
                ? 'All selected matches already have this template.'
                : 'No contests created.',
          );
        }}
      />
    </div>
  );
};

const Th = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element => (
  <th className={cn('px-3 py-2 text-xs font-semibold', className)}>{children}</th>
);

const Td = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element => (
  <td className={cn('px-3 py-2.5 align-middle', className)}>{children}</td>
);
