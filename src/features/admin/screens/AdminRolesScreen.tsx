import { Loader2, ShieldCheck } from 'lucide-react';

import { Badge, Card, Typography } from '@components/ui';

import { useAdminListRolesQuery } from '../admin.api';

/**
 * Admin → Roles. Read-only foundation. The seeded system roles ship
 * with the platform; the permission editor + custom-role flows land
 * in a later phase (Phase 10 — fine-grained permissions).
 */
const AdminRolesScreen = (): JSX.Element => {
  const { data, isFetching } = useAdminListRolesQuery();

  return (
    <div className="space-y-6">
      <header>
        <Typography variant="h3">Roles &amp; permissions</Typography>
        <Typography variant="body" tone="muted">
          Default roles ship with the platform. Phase 10 introduces a
          full permission editor.
        </Typography>
      </header>

      {isFetching ? (
        <Card padding="lg">
          <div className="flex items-center justify-center py-8 text-text-muted">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {(data?.roles ?? []).map((role) => (
            <Card key={role.id ?? role.key} padding="lg">
              <header className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <Typography variant="h4">{role.name}</Typography>
                    <Typography variant="caption" tone="muted">
                      {role.key}
                    </Typography>
                  </div>
                </div>
                {role.isSystem ? <Badge tone="primary">System</Badge> : <Badge tone="info">Custom</Badge>}
              </header>

              {role.description ? (
                <Typography variant="body" tone="muted" className="mt-3">
                  {role.description}
                </Typography>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-1.5">
                {role.permissions.map((p) => (
                  <Badge key={p} tone="neutral">
                    {p}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRolesScreen;
