/**
 * Get Job by ID API
 * Server API route for fetching a single job by ID
 */
import type { Job } from '@job/types/job'
import { useApiClient } from '@auth/utils/api-client'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job ID is required',
      })
    }

    const authHeader = getHeader(event, 'authorization')
    
    const apiClient = useApiClient()

    // Backend endpoint is public, but we can pass auth header if available
    const headers: Record<string, string> = {}
    if (authHeader) {
      headers.Authorization = authHeader
    }

    // Call backend API
    const backendJob = await apiClient.get<{
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
      applications?: Array<{ id: string; status: string }>
    }>(`/jobs/${id}`, headers)

    // Map backend response to frontend Job type
    const job: Job = {
      id: backendJob.id,
      title: backendJob.title,
      description: backendJob.description || '',
      company: backendJob.company,
      location: backendJob.location || '',
      requirements: backendJob.requirements || [],
      salary: backendJob.salaryMin && backendJob.salaryMax
        ? {
            min: Number(backendJob.salaryMin),
            max: Number(backendJob.salaryMax),
            currency: 'USD', // Default currency
          }
        : undefined,
      status: backendJob.status.toLowerCase() as Job['status'],
      candidates: backendJob.applications
        ? {
            active: backendJob.applications.filter((app) => app.status === 'PENDING' || app.status === 'REVIEWING').length,
            total: backendJob.applications.length,
          }
        : undefined,
      createdAt: new Date(backendJob.createdAt),
      updatedAt: new Date(backendJob.updatedAt),
    }

    return {
      job,
    }
  } catch (error) {
    console.error('Error in /api/jobs/[id].get.ts:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to fetch job'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch job',
    })
  }
})

