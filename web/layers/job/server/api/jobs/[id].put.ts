/**
 * Update Job API
 * Server API route for updating a job by ID
 */
import type { Job, CreateJobInput } from '@job/types/job'
import { useApiClient } from '@auth/utils/api-client'
import type { ApiResponse } from '../../../../../../types/api-response'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody<Partial<CreateJobInput> & { status?: Job['status'] }>(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Job ID is required',
      })
    }

    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Authorization header required',
      })
    }

    const apiClient = useApiClient()

    // Map frontend status to backend status (draft -> DRAFT, published -> PUBLISHED, etc.)
    const updatePayload: Record<string, unknown> = {}
    if (body.title !== undefined) updatePayload.title = body.title
    if (body.description !== undefined) updatePayload.description = body.description
    if (body.company !== undefined) updatePayload.company = body.company
    if (body.location !== undefined) updatePayload.location = body.location
    if (body.requirements !== undefined) updatePayload.requirements = body.requirements
    if (body.salary) {
      updatePayload.salaryMin = body.salary.min
      updatePayload.salaryMax = body.salary.max
    }
    if (body.status !== undefined) {
      // Convert frontend status to backend status
      updatePayload.status = body.status.toUpperCase() // draft -> DRAFT, published -> PUBLISHED, etc.
    }

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.patch<{
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
    }>(`/jobs/${id}`, updatePayload, {
      Authorization: authHeader,
    })

    // Extract data from backend response
    const backendJob = backendResponse.data

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

    // Return in standard format
    return {
      data: job,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<Job>
  } catch (error) {
    console.error('Error in /api/jobs/[id].put.ts:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to update job'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update job',
    })
  }
})

