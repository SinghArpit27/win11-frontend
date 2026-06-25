import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Badge, Button, Card, Typography } from '@components/ui';
import { AuditAction, AuditOutcome } from '@shared/enums';

import { useAdminListAuditLogsQuery } from '../admin.api';

const OUTCOME_TONE: Record<AuditOutcome, 'success' | 'danger'> = {
  [AuditOutcome.SUCCESS]: 'success',
  [AuditOutcome.FAILURE]: 'danger',
};

/**
 * Admin → Audit logs. Server-paginated. Foundations for the security
 * forensics flow that ships in Phase 10. Filters expose action +
 * outcome — enough to build investigative queries today.
 */
const AdminAuditLogsScreen = (): JSX.Element => {
  const [action, setAction] = useState<AuditAction | ''>('');
  const [outcome, setOutcome] = useState<AuditOutcome | ''>('');
  const [page, setPage] = useState(1);

  const { data, isFetching } = useAdminListAuditLogsQuery({
    page,
    limit: 25,
    action: action || undefined,
    outcome: outcome || undefined,
  });

  return (
    <div className="space-y-6">
      <header>
        <Typography variant="h3">Audit logs</Typography>
        <Typography variant="body" tone="muted">
          Every privileged action is recorded here. Use filters to narrow
          down by action, outcome, actor or date range.
        </Typography>
      </header>

      <Card padding="md">
        <div className="flex flex-wrap gap-3">
          <select
            value={action}
            onChange={(e) => {
              setPage(1);
              setAction(e.target.value as AuditAction | '');
            }}
            className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
            aria-label="Filter by action"
          >
            <option value="">All actions</option>
            {Object.values(AuditAction).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={outcome}
            onChange={(e) => {
              setPage(1);
              setOutcome(e.target.value as AuditOutcome | '');
            }}
            className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
            aria-label="Filter by outcome"
          >
            <option value="">All outcomes</option>
            {Object.values(AuditOutcome).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-elevated text-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Outcome</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : (data?.items ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                    No audit entries match the current filters.
                  </td>
                </tr>
              ) : (
                data!.items.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 text-text-muted">{new Date(row.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium">{row.action}</td>
                    <td className="px-4 py-3">
                      <Badge tone={OUTCOME_TONE[row.outcome]}>{row.outcome}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {row.actorId ?? <span className="text-text-muted">system</span>}
                    </td>
                    <td className="px-4 py-3">
                      {row.resource ? (
                        <>
                          <div className="font-medium">{row.resource}</div>
                          {row.resourceId ? (
                            <div className="text-xs text-text-muted">{row.resourceId}</div>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-muted">{row.ip ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <footer className="flex items-center justify-between">
        <Typography variant="caption" tone="muted">
          Page {data?.meta?.page ?? page} of {data?.meta?.totalPages ?? 1}
        </Typography>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!data?.meta?.hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!data?.meta?.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default AdminAuditLogsScreen;
