/**
 * Update Job API
 * Server API route for updating a job by ID
 */
import type { Job, CreateJobInput } from '@job/types/job'
import { useApiClient } from '@shared/api'
import type { ApiResponse } from '@/types/api-response'
import { logError } from '@shared/logging'
import { jobTransformer, type BackendJob } from '@shared/transformers'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody<Partial<CreateJobInput> & { status?: Job['status'] }>(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job ID is required',
      })
    }

    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Authorization header required',
      })
    }

    const apiClient = useApiClient()

    // Map frontend status to backend status (draft -> DRAFT, published -> PUBLISHED, etc.)
    const updatePayload: Record<string, unknown> = {}
    if (body.title !== undefined) updatePayload.title = body.title
    if (body.description !== undefined) updatePayload.description = body.description
    if (body.company !== undefined) updatePayload.company = body.company
    if (body.location !== undefined) updatePayload.location = body.location
    if (body.requirements !== undefined) updatePayload.requirements = body.requirements
    if (body.salary) {
      updatePayload.salaryMin = body.salary.min
      updatePayload.salaryMax = body.salary.max
    }
    if (body.status !== undefined) {
      // Convert frontend status to backend status
      updatePayload.status = body.status.toUpperCase() // draft -> DRAFT, published -> PUBLISHED, etc.
    }

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.patch<BackendJob>(`/jobs/${id}`, updatePayload, {
      Authorization: authHeader,
    })

    // Transform backend response to frontend Job type
    const job: Job = jobTransformer.transform(backendResponse.data)

    // Return in standard format
    return {
      data: job,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<Job>
  } catch (error) {
    logError('Error in /api/jobs/[id].put.ts', error, 'jobs.[id].put')
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to update job'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update job',
    })
  }
})

