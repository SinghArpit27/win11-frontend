import { Loader2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Badge,
  Button,
  Card,
  Input,
  Typography,
} from '@components/ui';
import { useDebounce } from '@hooks/useDebounce';
import { UserStatus } from '@shared/enums';

import { ROUTES } from '@constants/routes.constants';
import { useAdminListUsersQuery } from '../admin.api';

const STATUS_TONE: Record<UserStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.PENDING_VERIFICATION]: 'warning',
  [UserStatus.SUSPENDED]: 'danger',
  [UserStatus.DELETED]: 'neutral',
};

/**
 * Admin → Users list. Foundations:
 *  - server-side search + status filter,
 *  - paginated table,
 *  - row links to a detail screen (extended in later phases).
 *
 * The screen reuses platform primitives — no hardcoded colours, no
 * bespoke styling — so it inherits theme + light/dark out of the box.
 */
const AdminUsersScreen = (): JSX.Element => {
  const [searchRaw, setSearchRaw] = useState('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const search = useDebounce(searchRaw, 300);

  const { data, isFetching } = useAdminListUsersQuery({
    page,
    limit: 20,
    q: search || undefined,
    status: status || undefined,
  });

  const rows = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography variant="h3">Users</Typography>
          <Typography variant="body" tone="muted">
            {data?.meta?.total ?? 0} accounts
          </Typography>
        </div>
      </header>

      <Card padding="md">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search by email / phone / username"
            leftAdornment={<Search className="h-4 w-4" />}
            value={searchRaw}
            onChange={(e) => {
              setPage(1);
              setSearchRaw(e.target.value);
            }}
            className="max-w-sm"
          />
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as UserStatus | '');
            }}
            className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {Object.values(UserStatus).map((s) => (
              <option key={s} value={s}>
                {s}
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
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Roles</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                    No users match the current filters.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.displayName ?? u.username ?? '—'}</div>
                      <div className="text-xs text-text-muted">{u.email ?? u.phone ?? '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <Badge key={r} tone="primary">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[u.status]}>{u.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {'createdAt' in u ? '—' : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={ROUTES.ADMIN_USER_DETAIL.replace(':userId', u.id)}>
                          View
                        </Link>
                      </Button>
                    </td>
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

export default AdminUsersScreen;
