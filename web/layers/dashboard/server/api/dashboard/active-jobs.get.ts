import { useApiClient } from '@auth/utils/api-client'
import type { ApiResponse } from '../../../../../../types/api-response'

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

    // Get query parameters
    const query = getQuery(event)
    const limit = query.limit ? Number(query.limit) : 10

    const apiClient = useApiClient()

    // Call backend API to get active jobs - returns { data, meta, status } format
    const endpoint = limit ? `/dashboard/active-jobs?limit=${limit}` : '/dashboard/active-jobs'
    const backendResponse = await apiClient.get<{
      jobs: Array<{
        id: string
        title: string
        status: 'published' | 'draft' | 'closed'
        candidatesCount: number
        topMatchScore: number | null
        lastActivityAt: string
        lastMatchingRunAt: string | null
      }>
    }>(endpoint, {
      Authorization: authHeader,
    })

    // Return in standard format
    return {
      data: backendResponse.data,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<{
      jobs: Array<{
        id: string
        title: string
        status: 'published' | 'draft' | 'closed'
        candidatesCount: number
        topMatchScore: number | null
        lastActivityAt: string
        lastMatchingRunAt: string | null
      }>
    }>
  } catch (error) {
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = (error as { message: string }).message || 'Failed to fetch active jobs'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch active jobs',
    })
  }
})
