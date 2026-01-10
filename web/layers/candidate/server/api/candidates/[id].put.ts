/**
 * Update Candidate API
 * Server API route for updating a candidate by ID
 */
import { useApiClient } from "@shared/api";
import type {
  Candidate,
  CreateCandidateInput,
} from "@candidate/types/candidate";
import type { ApiResponse } from "@/types/api-response";
import { logError } from "@shared/logging";
import {
  candidateTransformer,
  type BackendCandidate,
} from "@shared/transformers";

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

    const id = getRouterParam(event, "id");
    const body = await readBody<
      Partial<CreateCandidateInput> & { status?: Candidate["status"] }
    >(event);

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "Candidate ID is required",
      });
    }

    const apiClient = useApiClient();

    // Build update payload
    const updatePayload: Record<string, unknown> = {};
    if (body.firstName !== undefined) updatePayload.firstName = body.firstName;
    if (body.lastName !== undefined) updatePayload.lastName = body.lastName;
    if (body.email !== undefined) updatePayload.email = body.email;
    if (body.phone !== undefined) updatePayload.phone = body.phone;
    if (body.skills !== undefined) updatePayload.skills = body.skills;
    if (body.currentCompany !== undefined)
      updatePayload.currentCompany = body.currentCompany;

    // Transform experience from number to array format for backend
    if (body.experience !== undefined && body.experience !== null) {
      updatePayload.experience = [{ years: body.experience }];
    }

    // Add salary fields directly if provided
    if (body.currentSalary !== undefined) {
      updatePayload.currentSalary = body.currentSalary;
    }
    if (body.expectedSalary !== undefined) {
      updatePayload.expectedSalary = body.expectedSalary;
    }

    // Add detailed fields if provided
    if (body.educations !== undefined) {
      updatePayload.educations = body.educations;
    }
    if (body.skillsDetailed !== undefined) {
      updatePayload.skillsDetailed = body.skillsDetailed;
    }
    if (body.workExperiences !== undefined) {
      updatePayload.workExperiences = body.workExperiences;
    }
    if (body.projects !== undefined) {
      updatePayload.projects = body.projects;
    }

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.patch<BackendCandidate>(
      `/candidates/${id}`,
      updatePayload,
      {
        Authorization: authHeader,
      },
    );

    // Transform backend response to frontend format
    const candidate: Candidate = candidateTransformer.transform(
      backendResponse.data,
    );

    // Override status if provided in body
    if (body.status) {
      candidate.status = body.status;
    }

    // Return in standard format
    return {
      data: candidate,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<Candidate>;
  } catch (error) {
    logError(
      "Error in /api/candidates/[id].put.ts",
      error,
      "candidates.[id].put",
    );
    // Handle backend errors
    if (error && typeof error === "object" && "statusCode" in error) {
      const statusCode = (error as { statusCode: number }).statusCode;
      const message =
        "message" in error && typeof error.message === "string"
          ? error.message
          : "Failed to update candidate";

      throw createError({
        statusCode,
        message,
      });
    }

    throw createError({
      statusCode: 500,
      message: "Failed to update candidate",
    });
  }
});
