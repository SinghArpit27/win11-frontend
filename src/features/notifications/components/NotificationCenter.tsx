import { Bell, CheckCheck } from 'lucide-react';
import { useCallback } from 'react';

import { Button, Modal, ModalContent, ModalHeader, ModalTitle, Skeleton, Typography } from '@components/ui';
import { cn } from '@utils/cn';

import {
  useGetUnreadNotificationCountQuery,
  useListMyNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '../notification.api';
import type { NotificationItem } from '../notification.types';

interface NotificationCenterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatRelativeTime = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationRow = ({
  item,
  onRead,
}: {
  item: NotificationItem;
  onRead: (id: string) => void;
}): JSX.Element => (
  <button
    type="button"
    onClick={() => {
      if (!item.isRead) onRead(item.id);
    }}
    className={cn(
      'flex w-full flex-col gap-1 rounded-lg border border-border px-3 py-2.5 text-left transition-colors',
      item.isRead ? 'bg-surface opacity-80' : 'bg-surface-elevated hover:bg-surface-hover',
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <Typography variant="body" className="font-semibold leading-snug">
        {item.title}
      </Typography>
      {!item.isRead ? (
        <span aria-hidden className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
      ) : null}
    </div>
    <Typography variant="caption" tone="muted" className="line-clamp-2">
      {item.body}
    </Typography>
    <Typography variant="caption" tone="muted">
      {formatRelativeTime(item.createdAt)}
    </Typography>
  </button>
);

export const NotificationCenter = ({ open, onOpenChange }: NotificationCenterProps): JSX.Element => {
  const listQuery = useListMyNotificationsQuery({ page: 1, limit: 30 }, { skip: !open });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, markAllState] = useMarkAllNotificationsReadMutation();

  const handleRead = useCallback(
    (notificationId: string) => {
      void markRead({ notificationId });
    },
    [markRead],
  );

  const handleMarkAll = useCallback(() => {
    void markAllRead();
  }, [markAllRead]);

  const items = listQuery.data?.items ?? [];

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-h-[85dvh] overflow-hidden md:max-w-lg">
        <ModalHeader>
          <ModalTitle>Notifications</ModalTitle>
        </ModalHeader>

        <div className="flex items-center justify-between gap-2 pb-2">
          <Typography variant="caption" tone="muted">
            {listQuery.isLoading ? 'Loading…' : `${items.length} recent`}
          </Typography>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={markAllState.isLoading || items.every((n) => n.isRead)}
            onClick={handleMarkAll}
            className="gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        </div>

        <div className="flex max-h-[60dvh] flex-col gap-2 overflow-y-auto pr-1">
          {listQuery.isLoading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Bell className="h-8 w-8 text-text-muted" />
              <Typography variant="body" tone="muted">
                No notifications yet
              </Typography>
            </div>
          ) : (
            items.map((item) => (
              <NotificationRow key={item.id} item={item} onRead={handleRead} />
            ))
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};

interface NotificationBellProps {
  className?: string;
  onClick: () => void;
}

export const NotificationBell = ({ className, onClick }: NotificationBellProps): JSX.Element => {
  const unreadQuery = useGetUnreadNotificationCountQuery(undefined, {
    pollingInterval: 60_000,
  });
  const unread = unreadQuery.data?.unreadCount ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted',
        'transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        className,
      )}
      aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
    >
      <Bell className="h-4 w-4" />
      {unread > 0 ? (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
        >
          {unread > 99 ? '99+' : unread}
        </span>
      ) : null}
    </button>
  );
};
