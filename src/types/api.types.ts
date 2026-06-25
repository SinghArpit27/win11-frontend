/**
 * Frontend re-export of the canonical API envelope so feature code
 * imports from `@types/api.types` rather than reaching across packages.
 * The single source of truth lives in `shared/types/api.types.ts`.
 */
export type { ApiResponse, ApiSuccess, ApiFailure } from '@shared/types/api.types';
export type { PaginationMeta, PaginationParams } from '@shared/types/pagination.types';
