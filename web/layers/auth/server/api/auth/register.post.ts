import { z } from 'zod'

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = registerSchema.parse(body)

    // TODO: Implement actual registration logic
    // For now, return mock response
    const mockUser = {
      id: 'user-' + Date.now(),
      email: validated.email,
      firstName: validated.firstName,
      lastName: validated.lastName,
    }

    const mockToken = 'mock-jwt-token-' + Date.now()

    return {
      user: mockUser,
      token: mockToken,
      refreshToken: 'mock-refresh-token-' + Date.now(),
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
      statusCode: 400,
      message: 'Registration failed',
    })
  }
})

