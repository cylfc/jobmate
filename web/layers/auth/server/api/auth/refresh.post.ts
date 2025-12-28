import { z } from 'zod'
import { useApiClient } from '@auth/utils/api-client'

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = refreshTokenSchema.parse(body)

    const apiClient = useApiClient()

    // Call backend API
    const response = await apiClient.post<{
      accessToken: string
      refreshToken: string
    }>('/auth/refresh', {
      refreshToken: validated.refreshToken,
    })

    return {
      token: response.accessToken,
      refreshToken: response.refreshToken,
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
      const message = (error as { message: string }).message || 'Token refresh failed'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 401,
      message: 'Invalid refresh token',
    })
  }
})

