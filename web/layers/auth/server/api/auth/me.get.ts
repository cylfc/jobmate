import { useApiClient } from '@auth/utils/api-client'

export default defineEventHandler(async (event) => {
  try {
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
    const response = await apiClient.get<{
      id: string
      email: string
      firstName?: string
      lastName?: string
      phone?: string
      avatarUrl?: string
      emailVerified: boolean
      isActive: boolean
      role: string
      lastLoginAt?: string
      createdAt: string
      updatedAt: string
    }>('/auth/me', {
      Authorization: authHeader,
    })

    // Transform backend response to frontend format
    return {
      user: {
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        phone: response.phone,
        avatarUrl: response.avatarUrl,
        role: response.role,
        emailVerified: response.emailVerified,
        isActive: response.isActive,
        lastLoginAt: response.lastLoginAt,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      },
    }
  } catch (error) {
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = (error as { message: string }).message || 'Failed to get user profile'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }
})

