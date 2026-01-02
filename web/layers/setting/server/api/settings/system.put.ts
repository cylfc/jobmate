import { z } from 'zod'
import { useApiClient } from '@auth/utils/api-client'
import type { SystemConfig } from '@setting/types/setting'
import type { ApiResponse } from '../../../../../../types/api-response'

const systemConfigSchema = z.object({
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
  language: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validated = systemConfigSchema.parse(body)

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
    const backendResponse = await apiClient.put<SystemConfig>(
      '/settings/system',
      validated,
      {
        Authorization: authHeader,
      }
    )

    // Return in standard format
    return {
      data: backendResponse.data,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<SystemConfig>
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
      const message = (error as { message: string }).message || 'Failed to update system config'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update system config',
    })
  }
})

