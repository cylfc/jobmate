/**
 * Delete Job API
 * Server API route for deleting a job by ID
 */
import { useApiClient } from '@auth/utils/api-client'
import type { ApiResponse } from '../../../../../../types/api-response'

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
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Authorization header required',
      })
    }

    const apiClient = useApiClient()

    // Call backend API - returns { data: null, meta: undefined, status: 204 }
    const backendResponse = await apiClient.delete(`/jobs/${id}`, {
      Authorization: authHeader,
    })

    // Return in standard format
    return {
      data: {
        success: true,
        message: 'Job deleted successfully',
      },
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<{
      success: boolean
      message: string
    }>
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to delete job'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to delete job',
    })
  }
})

