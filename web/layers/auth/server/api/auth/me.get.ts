import { useApiClient } from '@auth/utils/api-client'
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

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.get<{
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
          lastLoginAt: responseData.lastLoginAt,
          createdAt: responseData.createdAt,
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
        lastLoginAt?: string
        createdAt: string
        updatedAt: string
      }
    }>
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

