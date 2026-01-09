/**
 * Get Job by ID API
 * Server API route for fetching a single job by ID
 */
import type { Job } from '@job/types/job'
import { useApiClient } from '@shared/api'
import type { ApiResponse } from '@/types/api-response'
import { logError } from '@shared/logging'
import { jobTransformer, type BackendJob } from '@shared/transformers'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job ID is required',
      })
    }

    const authHeader = getHeader(event, 'authorization')
    
    const apiClient = useApiClient()

    // Backend endpoint is public, but we can pass auth header if available
    const headers: Record<string, string> = {}
    if (authHeader) {
      headers.Authorization = authHeader
    }

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.get<BackendJob>(`/jobs/${id}`, headers)

    // Transform backend response to frontend Job type
    const job: Job = jobTransformer.transform(backendResponse.data)

    // Return in standard format
    return {
      data: job,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<Job>
  } catch (error) {
    logError('Error in /api/jobs/[id].get.ts', error, 'jobs.[id].get')
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to fetch job'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch job',
    })
  }
})

