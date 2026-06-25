import { Loader2, ShieldOff, UserCog } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { Badge, Button, Card, Typography } from '@components/ui';
import { ROUTES } from '@constants/routes.constants';
import { UserStatus } from '@shared/enums';

import {
  useAdminGetUserQuery,
  useAdminRevokeUserSessionsMutation,
  useAdminUpdateUserMutation,
} from '../admin.api';

/**
 * Admin → User detail. Foundation surface. Phase 10 / wallet phases
 * extend this screen with deeper tooling (wallet adjustments, KYC, etc.).
 */
const AdminUserDetailScreen = (): JSX.Element => {
  const { userId } = useParams<{ userId: string }>();
  const { data, isFetching } = useAdminGetUserQuery({ userId: userId ?? '' }, { skip: !userId });
  const [updateUser, updateState] = useAdminUpdateUserMutation();
  const [revokeSessions, revokeState] = useAdminRevokeUserSessionsMutation();

  if (!userId) return <Typography variant="body">Missing user id.</Typography>;
  if (isFetching || !data) {
    return (
      <div className="flex items-center justify-center py-12 text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const user = data.user;
  const isSuspended = user.status === UserStatus.SUSPENDED;

  const toggleSuspended = (): void => {
    void updateUser({
      userId,
      body: { status: isSuspended ? UserStatus.ACTIVE : UserStatus.SUSPENDED },
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link to={ROUTES.ADMIN_USERS}>← Back to users</Link>
        </Button>
      </header>

      <Card padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Typography variant="h3">
              {user.displayName ?? user.username ?? '—'}
            </Typography>
            <Typography variant="body" tone="muted">
              {user.email ?? user.phone ?? '—'}
            </Typography>
            <div className="mt-3 flex flex-wrap gap-2">
              {user.roles.map((r) => (
                <Badge key={r} tone="primary">
                  {r}
                </Badge>
              ))}
              <Badge tone={isSuspended ? 'danger' : 'success'}>{user.status}</Badge>
              {user.emailVerified ? <Badge tone="success">Email verified</Badge> : null}
              {user.phoneVerified ? <Badge tone="success">Phone verified</Badge> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isSuspended ? 'success' : 'danger'}
              leftIcon={<UserCog className="h-4 w-4" />}
              loading={updateState.isLoading}
              onClick={toggleSuspended}
            >
              {isSuspended ? 'Reactivate' : 'Suspend'}
            </Button>
            <Button
              variant="outline"
              leftIcon={<ShieldOff className="h-4 w-4" />}
              loading={revokeState.isLoading}
              onClick={() => void revokeSessions({ userId })}
            >
              Force logout all
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminUserDetailScreen;
