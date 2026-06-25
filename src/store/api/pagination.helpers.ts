import type { PaginationMeta } from '@shared/types/pagination.types';

type EnvelopeMeta = { envelopeMeta?: PaginationMeta };

/**
 * Extracts backend pagination meta from RTK Query's `transformResponse` meta
 * argument. Falls back to a single-page meta when the server omits pagination
 * (non-paginated arrays).
 */
export const extractPaginationMeta = (
  meta: unknown,
  fallbackCount: number,
): PaginationMeta => {
  const envelope = (meta as EnvelopeMeta | undefined)?.envelopeMeta;
  if (envelope) return envelope;
  return {
    page: 1,
    limit: fallbackCount,
    total: fallbackCount,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  };
};

/** Nullable variant — used when list endpoints may omit meta entirely. */
export const extractPaginationMetaNullable = (
  meta: unknown,
): PaginationMeta | null => {
  const envelope = (meta as EnvelopeMeta | undefined)?.envelopeMeta;
  return envelope ?? null;
};

/** Standard `{ items, meta }` transform for paginated list endpoints. */
export const toPaginatedResponse = <T>(
  data: T[],
  meta: unknown,
): { items: T[]; meta: PaginationMeta } => ({
  items: data,
  meta: extractPaginationMeta(meta, data.length),
});

/** Nullable-meta variant for endpoints that sometimes omit pagination. */
export const toPaginatedResponseNullable = <T>(
  data: T[],
  meta: unknown,
): { items: T[]; meta: PaginationMeta | null } => ({
  items: data,
  meta: extractPaginationMetaNullable(meta),
});
