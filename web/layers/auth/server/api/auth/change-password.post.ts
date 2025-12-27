import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = changePasswordSchema.parse(body)

    // TODO: Implement actual password change logic
    // For now, just return success
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

    throw createError({
      statusCode: 401,
      message: 'Current password is incorrect',
    })
  }
})

