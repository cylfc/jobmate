/**
 * Create Job API
 * Server API route for creating a new job
 */
import type { Job, CreateJobInput } from "@job/types/job";
import { useApiClient } from "@shared/api";
import type { ApiResponse } from "@/types/api-response";
import { logError } from "@shared/logging";
import { jobTransformer, type BackendJob } from "@shared/transformers";

export default defineEventHandler(async (event) => {
  try {
    // Get access token from Authorization header
    const authHeader = getHeader(event, "authorization");
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: "Authorization header required",
      });
    }

    const body = await readBody<CreateJobInput>(event);

    const apiClient = useApiClient();

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.post<BackendJob>("/jobs", body, {
      Authorization: authHeader,
    });

    // Transform backend response data to frontend Job type
    const job: Job = jobTransformer.transform(backendResponse.data);

    // Return in standard format
    return {
      data: job,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<Job>;
  } catch (error) {
    logError("Error in /api/jobs.post.ts", error, "jobs.post");
    if (error && typeof error === "object" && "statusCode" in error) {
      const statusCode = (error as { statusCode: number }).statusCode;
      const message =
        "message" in error && typeof error.message === "string"
          ? error.message
          : "Failed to create job";

      throw createError({
        statusCode,
        message,
      });
    }

    throw createError({
      statusCode: 500,
      message: "Failed to create job",
    });
  }
});
