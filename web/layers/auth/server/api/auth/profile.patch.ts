import { z } from 'zod'
import { useApiClient } from '@auth/utils/api-client'
import type { ApiResponse } from '../../../../../../types/api-response'

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = updateProfileSchema.parse(body)

    // Get access token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Authorization header required',
      })
    }

    const apiClient = useApiClient()

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.patch<{
      id: string
      email: string
      firstName?: string
      lastName?: string
      phone?: string
      avatarUrl?: string
      role: string
      emailVerified: boolean
      isActive: boolean
      updatedAt: string
    }>(
      '/auth/profile',
      validated,
      { Authorization: authHeader },
    )

    // Transform backend response data to frontend format
    const responseData = backendResponse.data

    // Return in standard format
    return {
      data: {
        user: {
          id: responseData.id,
          email: responseData.email,
          firstName: responseData.firstName,
          lastName: responseData.lastName,
          phone: responseData.phone,
          avatarUrl: responseData.avatarUrl,
          role: responseData.role,
          emailVerified: responseData.emailVerified,
          isActive: responseData.isActive,
          updatedAt: responseData.updatedAt,
        },
      },
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<{
      user: {
        id: string
        email: string
        firstName?: string
        lastName?: string
        phone?: string
        avatarUrl?: string
        role: string
        emailVerified: boolean
        isActive: boolean
        updatedAt: string
      }
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
      const message = (error as { message: string }).message || 'Failed to update profile'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update profile',
    })
  }
})

