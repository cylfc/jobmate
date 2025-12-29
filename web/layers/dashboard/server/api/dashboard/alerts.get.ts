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

    const apiClient = useApiClient()

    // Call backend API to get dashboard alerts
    const response = await apiClient.get<{
      alerts: Array<{
        id: string
        type: string
        message: string
        actionUrl: string
        severity: 'info' | 'warning' | 'critical'
      }>
    }>('/dashboard/alerts', {
      Authorization: authHeader,
    })

    return response
  } catch (error) {
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = (error as { message: string }).message || 'Failed to fetch dashboard alerts'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch dashboard alerts',
    })
  }
})
