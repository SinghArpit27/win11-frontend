import { Activity, ShieldAlert, UserCheck, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, Typography } from '@components/ui';

/**
 * Admin dashboard foundation. Renders placeholder KPI cards that later
 * phases (analytics, monitoring) populate with real data. The layout +
 * card primitives stay stable so feature phases just swap the values.
 */
const KPI_PLACEHOLDERS = [
  { label: 'Total users', value: '—', icon: Users, tone: 'text-primary' },
  { label: 'Active sessions', value: '—', icon: Activity, tone: 'text-success' },
  { label: 'New signups (24h)', value: '—', icon: UserCheck, tone: 'text-warning' },
  { label: 'Security events (24h)', value: '—', icon: ShieldAlert, tone: 'text-danger' },
];

const AdminDashboardScreen = (): JSX.Element => (
  <div className="space-y-6">
    <header>
      <Typography variant="h3">Overview</Typography>
      <Typography variant="body" tone="muted">
        Live KPIs land here in Phase 10 (analytics). The shell, cards and
        layout are production-ready.
      </Typography>
    </header>

    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_PLACEHOLDERS.map(({ label, value, icon: Icon, tone }) => (
        <Card key={label} padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="overline" tone="muted">
                {label}
              </Typography>
              <Typography variant="h3" className="mt-1">
                {value}
              </Typography>
            </div>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
          </div>
        </Card>
      ))}
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Recent suspicious activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body" tone="muted">
            A live feed of security events ships in Phase 10. The Audit Logs
            screen already supports filtering by `SUSPICIOUS_ACTIVITY`.
          </Typography>
        </CardContent>
      </Card>
      <Card padding="lg">
        <CardHeader>
          <CardTitle>System health</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="body" tone="muted">
            Health probe surface is exposed at <code>/health</code> and the
            Phase 1 health screen renders Mongo/Redis status.
          </Typography>
        </CardContent>
      </Card>
    </section>
  </div>
);

export default AdminDashboardScreen;
