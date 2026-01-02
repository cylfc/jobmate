/**
 * Standard API Response Types
 * All API responses follow this format:
 * {
 *   data: T,
 *   meta?: {
 *     pagination?: {
 *       page: number;
 *       limit: number;
 *       total: number;
 *       totalPages: number;
 *     }
 *   },
 *   status: number
 * }
 */

export interface PaginationMeta {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ApiMeta = PaginationMeta | Record<string, unknown> | undefined;

export interface ApiResponse<T = unknown> {
  data: T;
  meta?: ApiMeta;
  status: number;
}

