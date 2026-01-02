import { useApiClient } from '@auth/utils/api-client'
import type { SecuritySettings } from '@setting/types/setting'
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
    const backendResponse = await apiClient.get<SecuritySettings>(
      '/settings/security',
      {
        Authorization: authHeader,
      }
    )

    // Map backend response data to frontend format
    // Backend returns sessionTimeout in minutes, frontend expects seconds
    const responseData = backendResponse.data
    const settings: SecuritySettings = {
      twoFactorEnabled: responseData.twoFactorEnabled,
      sessionTimeout: responseData.sessionTimeout ? responseData.sessionTimeout * 60 : undefined, // Convert minutes to seconds
      loginNotifications: responseData.loginNotifications,
    }

    // Return in standard format
    return {
      data: settings,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<SecuritySettings>
  } catch (error) {
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to fetch security settings'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch security settings',
    })
  }
})

