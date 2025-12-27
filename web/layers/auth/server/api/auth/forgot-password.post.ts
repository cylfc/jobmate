import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = forgotPasswordSchema.parse(body)

    // TODO: Implement actual password reset logic
    // For now, just return success
    return {
      message: 'Password reset email sent',
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
      statusCode: 500,
      message: 'Failed to send password reset email',
    })
  }
})

