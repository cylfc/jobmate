import { useApiClient } from '@auth/utils/api-client'
import type { SecuritySettings } from '@setting/types/setting'

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

    // Call backend API
    const response = await apiClient.get<SecuritySettings>(
      '/settings/security',
      {
        Authorization: authHeader,
      }
    )

    // Map backend response to frontend format
    // Backend returns sessionTimeout in minutes, frontend expects seconds
    const settings: SecuritySettings = {
      twoFactorEnabled: response.twoFactorEnabled,
      sessionTimeout: response.sessionTimeout ? response.sessionTimeout * 60 : undefined, // Convert minutes to seconds
      loginNotifications: response.loginNotifications,
    }

    return {
      settings,
    }
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

