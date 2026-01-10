/**
 * Shared API Utilities
 * Centralized API client and utilities
 */

export {
  useApiClient,
  type ApiError,
  ErrorCode,
  getErrorCode,
  formatApiError,
} from "./api-client";
export {
  createBaseRouteHandler,
  getAuthHeader,
  requireAuth,
  type RouteHandlerOptions,
} from "./base-route-handler";
