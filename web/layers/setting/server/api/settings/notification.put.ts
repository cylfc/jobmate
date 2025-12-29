import { z } from 'zod'
import { useApiClient } from '@auth/utils/api-client'
import type { NotificationSettings } from '@setting/types/setting'

const notificationSchema = z.object({
  emailJobMatches: z.boolean().optional(),
  emailNewCandidates: z.boolean().optional(),
  emailWeeklyDigest: z.boolean().optional(),
  pushJobMatches: z.boolean().optional(),
  pushNewCandidates: z.boolean().optional(),
  pushMessages: z.boolean().optional(),
  inAppJobMatches: z.boolean().optional(),
  inAppNewCandidates: z.boolean().optional(),
  inAppMessages: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = notificationSchema.parse(body)

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
    const response = await apiClient.put<NotificationSettings>(
      '/settings/notification',
      validated,
      {
        Authorization: authHeader,
      }
    )

    return {
      settings: response,
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
      const message = (error as { message: string }).message || 'Failed to update notification settings'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update notification settings',
    })
  }
})

