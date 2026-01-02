import { z } from 'zod'
import { useApiClient } from '@auth/utils/api-client'
import type { ApiResponse } from '../../../../../../types/api-response'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = loginSchema.parse(body)

    const apiClient = useApiClient()

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.post<{
      user: {
        id: string
        email: string
        firstName?: string
        lastName?: string
        role: string
        emailVerified: boolean
        isActive: boolean
        createdAt: string
        updatedAt: string
      }
      accessToken: string
      refreshToken: string
    }>('/auth/login', {
      email: validated.email,
      password: validated.password,
    })

    // Transform backend response data to frontend format
    const responseData = backendResponse.data

    // Return in standard format
    return {
      data: {
        user: {
          id: responseData.user.id,
          email: responseData.user.email,
          firstName: responseData.user.firstName,
          lastName: responseData.user.lastName,
          role: responseData.user.role,
        },
        token: responseData.accessToken,
        refreshToken: responseData.refreshToken,
      },
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<{
      user: {
        id: string
        email: string
        firstName?: string
        lastName?: string
        role: string
      }
      token: string
      refreshToken: string
    }>
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
      const message = (error as { message: string }).message || 'Login failed'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 401,
      message: 'Invalid credentials',
    })
  }
})

