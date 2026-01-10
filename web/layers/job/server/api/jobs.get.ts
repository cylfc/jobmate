/**
 * Get Jobs API
 * Server API route for fetching jobs
 */
import type { Job, JobFilter } from "@job/types/job";
import { useApiClient } from "@shared/api";
import type { ApiResponse } from "@/types/api-response";
import { logError } from "@shared/logging";
import { jobTransformer, type BackendJob } from "@shared/transformers";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery<JobFilter>(event);
    const authHeader = getHeader(event, "authorization");

    const apiClient = useApiClient();

    // Build query params for backend
    const queryParams: Record<string, string> = {};
    if (query.search) {
      queryParams.search = query.search;
    }
    if (query.status) {
      queryParams.status = query.status.toUpperCase(); // Backend uses DRAFT, PUBLISHED, CLOSED
    }
    if (query.company) {
      queryParams.company = query.company;
    }
    if (query.location) {
      queryParams.location = query.location;
    }
    if (query.page) {
      queryParams.page = String(query.page);
    }
    if (query.limit) {
      queryParams.limit = String(query.limit);
    }

    const queryString = new URLSearchParams(queryParams).toString();
    const endpoint = `/jobs${queryString ? `?${queryString}` : ""}`;

    // Backend endpoint is public, but we can pass auth header if available
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    // Call backend API - returns { data: [...], meta: { pagination: {...} }, status: 200 }
    const backendResponse = await apiClient.get<BackendJob[]>(
      endpoint,
      headers,
    );

    // Transform backend response data to frontend Job type
    const jobs: Job[] = jobTransformer.transformMany(backendResponse.data);

    // Return in standard format with pagination from backend
    return {
      data: jobs,
      meta: backendResponse.meta, // Includes pagination info
      status: backendResponse.status,
    } as ApiResponse<Job[]>;
  } catch (error) {
    logError("Error in /api/jobs.get.ts", error, "jobs.get");
    if (error && typeof error === "object" && "statusCode" in error) {
      const statusCode = (error as { statusCode: number }).statusCode;
      const message =
        "message" in error && typeof error.message === "string"
          ? error.message
          : "Failed to fetch jobs";

      throw createError({
        statusCode,
        message,
      });
    }

    throw createError({
      statusCode: 500,
      message: "Failed to fetch jobs",
    });
  }
});
