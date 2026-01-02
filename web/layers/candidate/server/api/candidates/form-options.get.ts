/**
 * Get Candidate Form Options API
 * Returns available dropdown options for candidate forms
 */
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

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.get<{
      degreeTypes: Array<{ label: string; value: string }>
      skillTypes: Array<{ label: string; value: string }>
      skillLevels: Array<{ label: string; value: string }>
      employmentTypes: Array<{ label: string; value: string }>
    }>('/candidates/form-options', {
      Authorization: authHeader,
    })

    // Return in standard format
    return {
      data: backendResponse.data,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<{
      degreeTypes: Array<{ label: string; value: string }>
      skillTypes: Array<{ label: string; value: string }>
      skillLevels: Array<{ label: string; value: string }>
      employmentTypes: Array<{ label: string; value: string }>
    }>
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching form options:', error)
    
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to fetch form options'

      throw createError({
        statusCode,
        message,
      })
    }

    // Handle unknown errors
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch form options'
    throw createError({
      statusCode: 500,
      message: errorMessage,
    })
  }
})

