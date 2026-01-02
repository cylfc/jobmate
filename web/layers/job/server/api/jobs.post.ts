/**
 * Create Job API
 * Server API route for creating a new job
 */
import type { Job, CreateJobInput } from '@job/types/job'
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

    const body = await readBody<CreateJobInput>(event)

    const apiClient = useApiClient()

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.post<{
      id: string
      title: string
      description?: string
      company: string
      location?: string
      salaryMin?: number
      salaryMax?: number
      employmentType: string
      status: string
      requirements: string[]
      benefits: string[]
      postedAt?: string
      expiresAt?: string
      createdAt: string
      updatedAt: string
    }>('/jobs', body, {
      Authorization: authHeader,
    })

    // Map backend response data to frontend Job type
    const responseData = backendResponse.data
    const job: Job = {
      id: responseData.id,
      title: responseData.title,
      description: responseData.description || '',
      company: responseData.company,
      location: responseData.location || '',
      requirements: responseData.requirements || [],
      salary: responseData.salaryMin && responseData.salaryMax
        ? {
            min: Number(responseData.salaryMin),
            max: Number(responseData.salaryMax),
            currency: 'USD',
          }
        : undefined,
      status: responseData.status.toLowerCase() as Job['status'],
      createdAt: new Date(responseData.createdAt),
      updatedAt: new Date(responseData.updatedAt),
    }

    // Return in standard format
    return {
      data: job,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<Job>
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to create job'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to create job',
    })
  }
})

