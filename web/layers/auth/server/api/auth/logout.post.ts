import { z } from 'zod'
import { useApiClient } from '@auth/utils/api-client'

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = logoutSchema.parse(body)

    const apiClient = useApiClient()

    // Get access token from Authorization header if available
    const authHeader = getHeader(event, 'authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    // Call backend API
    await apiClient.post(
      '/auth/logout',
      {
        refreshToken: validated.refreshToken,
      },
      accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    )

    return {
      message: 'Logged out successfully',
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
      const message = (error as { message: string }).message || 'Logout failed'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to logout',
    })
  }
})

