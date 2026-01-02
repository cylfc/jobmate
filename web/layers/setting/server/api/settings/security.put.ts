import { z } from 'zod'
import { useApiClient } from '@auth/utils/api-client'
import type { SecuritySettings } from '@setting/types/setting'

const securitySchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().optional(),
  loginNotifications: z.boolean().optional(),
})

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

    const body = await readBody(event)
    const validated = securitySchema.parse(body)

    const apiClient = useApiClient()

    // Convert frontend format (seconds) to backend format (minutes)
    const updatePayload: Record<string, unknown> = {}
    if (validated.twoFactorEnabled !== undefined) {
      updatePayload.twoFactorEnabled = validated.twoFactorEnabled
    }
    if (validated.sessionTimeout !== undefined) {
      // Convert seconds to minutes for backend
      updatePayload.sessionTimeout = Math.round(validated.sessionTimeout / 60)
    }
    if (validated.loginNotifications !== undefined) {
      updatePayload.loginNotifications = validated.loginNotifications
    }

    // Call backend API
    const response = await apiClient.put<{
      twoFactorEnabled?: boolean
      sessionTimeout?: number // in minutes
      loginNotifications?: boolean
    }>(
      '/settings/security',
      updatePayload,
      {
        Authorization: authHeader,
      }
    )

    // Map backend response to frontend format (convert minutes to seconds)
    const updatedSettings: SecuritySettings = {
      twoFactorEnabled: response.twoFactorEnabled,
      sessionTimeout: response.sessionTimeout ? response.sessionTimeout * 60 : undefined, // Convert minutes to seconds
      loginNotifications: response.loginNotifications,
    }

    return {
      settings: updatedSettings,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: 'Invalid input',
        data: error.errors,
      })
    }

    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to update security settings'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update security settings',
    })
  }
})

