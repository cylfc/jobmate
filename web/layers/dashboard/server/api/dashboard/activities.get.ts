import { useApiClient } from '@auth/utils/api-client'

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
    const limit = query.limit ? Number(query.limit) : 20
    const cursor = query.cursor ? String(query.cursor) : undefined

    const apiClient = useApiClient()

    // Build query string
    const queryParams = new URLSearchParams()
    queryParams.append('limit', String(limit))
    if (cursor) {
      queryParams.append('cursor', cursor)
    }
    const endpoint = `/dashboard/activities?${queryParams.toString()}`

    // Call backend API to get recent activities
    const response = await apiClient.get<{
      events: Array<{
        id: string
        type: 'cv_uploaded' | 'job_saved' | 'matching_completed' | 'interview_scheduled'
        occurredAt: string
        meta?: Record<string, unknown>
      }>
      nextCursor?: string | null
      hasMore?: boolean
    }>(endpoint, {
      Authorization: authHeader,
    })

    return response
  } catch (error) {
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = (error as { message: string }).message || 'Failed to fetch recent activities'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch recent activities',
    })
  }
})
