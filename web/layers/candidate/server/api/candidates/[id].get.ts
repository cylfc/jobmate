/**
 * Get Candidate by ID API
 * Server API route for fetching a single candidate by ID
 */
import { useApiClient } from '@shared/api'
import type { Candidate } from '@candidate/types/candidate'
import type { ApiResponse } from '@/types/api-response'

export default defineEventHandler(async (event) => {
  try {
    // Get access token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Authorization header required',
      })
    }

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Candidate ID is required',
      })
    }

    const apiClient = useApiClient()

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.get<BackendCandidate>(`/candidates/${id}`, {
      Authorization: authHeader,
    })

    // Transform backend response to frontend format
    const candidate: Candidate = candidateTransformer.transform(backendResponse.data)

    // Return in standard format
    return {
      data: candidate,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<Candidate>
  } catch (error) {
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to fetch candidate'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch candidate',
    })
  }
})

