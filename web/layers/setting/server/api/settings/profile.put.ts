import { z } from 'zod'
import { useApiClient } from '@auth/utils/api-client'
import type { UserProfile } from '@setting/types/setting'
import type { ApiResponse } from '../../../../../../types/api-response'

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = profileSchema.parse(body)

    // Get access token from Authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Authorization header required',
      })
    }

    const apiClient = useApiClient()

    // Call auth API to update profile - returns { data, meta, status } format
    const backendResponse = await apiClient.patch<{
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
    }>(
      '/auth/profile',
      {
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
        // Note: email and bio are not updatable via auth API
      },
      { Authorization: authHeader },
    )

    // Transform to UserProfile format
    const responseData = backendResponse.data
    const updatedProfile: UserProfile = {
      firstName: responseData.user.firstName || '',
      lastName: responseData.user.lastName || '',
      email: responseData.user.email,
      phone: responseData.user.phone,
      bio: validated.bio, // Keep bio from request as it's not in response
    }

    // Return in standard format
    return {
      data: updatedProfile,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<UserProfile>
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

