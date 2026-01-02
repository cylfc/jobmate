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

    const apiClient = useApiClient()

    // Call backend API to get dashboard KPIs - returns { data, meta, status } format
    const backendResponse = await apiClient.get<{
      openJobs: number
      candidatesInPipeline: number
      matchesThisWeek: number
      averageMatchScore: number
      timeToShortlist: number
    }>('/dashboard/kpis', {
      Authorization: authHeader,
    })

    // Return in standard format
    return {
      data: backendResponse.data,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<{
      openJobs: number
      candidatesInPipeline: number
      matchesThisWeek: number
      averageMatchScore: number
      timeToShortlist: number
    }>
  } catch (error) {
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = (error as { message: string }).message || 'Failed to fetch dashboard KPIs'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch dashboard KPIs',
    })
  }
})
