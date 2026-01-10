/**
 * Base API Route Handler
 * Provides common functionality for server API routes
 */

import type { ApiResponse } from "@/types/api-response";
import { logError } from "@shared/logging";

export interface RouteHandlerOptions {
  requireAuth?: boolean;
  context?: string;
}

/**
 * Base handler for API routes
 * Handles common error handling and response formatting
 */
export function createBaseRouteHandler<T>(
  handler: (event: any) => Promise<T>,
  options: RouteHandlerOptions = {},
) {
  return defineEventHandler(async (event) => {
    try {
      // Check authentication if required
      if (options.requireAuth) {
        const authHeader = getHeader(event, "authorization");
        if (!authHeader) {
          throw createError({
            statusCode: 401,
            message: "Authorization header required",
          });
        }
      }

      // Execute handler
      const result = await handler(event);

      // If result is already an ApiResponse, return as is
      if (
        result &&
        typeof result === "object" &&
        "data" in result &&
        "status" in result
      ) {
        return result as ApiResponse<T>;
      }

      // Otherwise wrap in standard format
      return {
        data: result,
        meta: undefined,
        status: 200,
      } as ApiResponse<T>;
    } catch (error) {
      const context = options.context || "base-route-handler";
      logError(`Error in ${context}`, error, context);

      // Handle known errors
      if (error && typeof error === "object" && "statusCode" in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        const message =
          "message" in error && typeof error.message === "string"
            ? error.message
            : "Request failed";

        throw createError({
          statusCode,
          message,
        });
      }

      // Handle unknown errors
      const errorMessage =
        error instanceof Error ? error.message : "Request failed";
      throw createError({
        statusCode: 500,
        message: errorMessage,
      });
    }
  });
}

/**
 * Helper to get auth header from event
 */
export function getAuthHeader(event: any): string | null {
  return getHeader(event, "authorization");
}

/**
 * Helper to require auth header
 */
export function requireAuth(event: any): string {
  const authHeader = getAuthHeader(event);
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: "Authorization header required",
    });
  }
  return authHeader;
}
