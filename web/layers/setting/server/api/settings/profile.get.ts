import { useApiClient } from '@auth/utils/api-client'
import type { UserProfile } from '@setting/types/setting'
import type { ApiResponse } from '../../../../../../types/api-response'

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

    // Call auth API to get user profile - returns { data, meta, status } format
    const backendResponse = await apiClient.get<{
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
        lastLoginAt?: string
        createdAt: string
        updatedAt: string
      }
    }>('/auth/me', {
      Authorization: authHeader,
    })

    // Transform to UserProfile format
    const responseData = backendResponse.data
    const profile: UserProfile = {
      firstName: responseData.user.firstName || '',
      lastName: responseData.user.lastName || '',
      email: responseData.user.email,
      phone: responseData.user.phone,
      bio: '', // Bio is not in auth API, can be added later
    }

    // Return in standard format
    return {
      data: profile,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<UserProfile>
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

