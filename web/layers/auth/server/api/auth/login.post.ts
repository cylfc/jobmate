import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = loginSchema.parse(body)

    // TODO: Implement actual authentication logic
    // For now, return mock response
    const mockUser = {
      id: 'user-1',
      email: validated.email,
      firstName: 'John',
      lastName: 'Doe',
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
      statusCode: 401,
      message: 'Invalid credentials',
    })
  }
})

