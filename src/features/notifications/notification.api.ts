import { baseApi } from '@store/api/base.api';
import { extractPaginationMeta } from '@store/api/pagination.helpers';

import type { NotificationItem, NotificationPage, UnreadCountResponse } from './notification.types';

export interface NotificationListQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationItem['type'];
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listMyNotifications: build.query<NotificationPage, NotificationListQuery | void>({
      query: (params) => ({ url: '/notifications', params: params ?? {} }),
      transformResponse: (data: NotificationItem[], meta) => ({
        items: data,
        meta: extractPaginationMeta(meta, data.length),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification', id: 'LIST' },
            ]
          : [{ type: 'Notification', id: 'LIST' }],
    }),

    getUnreadNotificationCount: build.query<UnreadCountResponse, void>({
      query: () => ({ url: '/notifications/unread-count' }),
      providesTags: [{ type: 'Notification', id: 'UNREAD_COUNT' }],
    }),

    markNotificationRead: build.mutation<NotificationItem, { notificationId: string }>({
      query: ({ notificationId }) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, { notificationId }) => [
        { type: 'Notification', id: notificationId },
        { type: 'Notification', id: 'LIST' },
        { type: 'Notification', id: 'UNREAD_COUNT' },
      ],
    }),

    markAllNotificationsRead: build.mutation<{ updated: number }, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }, { type: 'Notification', id: 'UNREAD_COUNT' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useListMyNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
