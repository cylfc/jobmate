import { useApiClient } from '@auth/utils/api-client'
import type { UserProfile } from '@setting/types/setting'

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

    // Call auth API to get user profile
    const response = await apiClient.get<{
      id: string
      email: string
      firstName?: string
      lastName?: string
      phone?: string
      avatarUrl?: string
      role: string
      emailVerified: boolean
      isActive: boolean
      lastLoginAt?: string
      createdAt: string
      updatedAt: string
    }>('/auth/me', {
      Authorization: authHeader,
    })

    // Transform to UserProfile format
    const profile: UserProfile = {
      firstName: response.firstName || '',
      lastName: response.lastName || '',
      email: response.email,
      phone: response.phone,
      bio: '', // Bio is not in auth API, can be added later
    }

    return {
      profile,
    }
  } catch (error) {
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = (error as { message: string }).message || 'Failed to fetch profile'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch profile',
    })
  }
})

