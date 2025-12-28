import { z } from 'zod'
import { useApiClient } from '@auth/utils/api-client'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'New password and confirm password do not match',
  path: ['confirmPassword'],
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = changePasswordSchema.parse(body)

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
    await apiClient.patch(
      '/auth/change-password',
      {
        currentPassword: validated.currentPassword,
        newPassword: validated.newPassword,
        confirmPassword: validated.confirmPassword,
      },
      { Authorization: authHeader },
    )

    return {
      message: 'Password changed successfully',
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
      const message = (error as { message: string }).message || 'Password change failed'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 401,
      message: 'Current password is incorrect',
    })
  }
})

