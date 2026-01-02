/**
 * Get Jobs API
 * Server API route for fetching jobs
 */
import type { Job, JobFilter } from '@job/types/job'
import { useApiClient } from '@auth/utils/api-client'
import type { ApiResponse } from '../../../../../../types/api-response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery<JobFilter>(event)
    const authHeader = getHeader(event, 'authorization')
    
    const apiClient = useApiClient()

    // Build query params for backend
    const queryParams: Record<string, string> = {}
    if (query.search) {
      queryParams.search = query.search
    }
    if (query.status) {
      queryParams.status = query.status.toUpperCase() // Backend uses DRAFT, PUBLISHED, CLOSED
    }
    if (query.company) {
      queryParams.company = query.company
    }
    if (query.location) {
      queryParams.location = query.location
    }
    if (query.page) {
      queryParams.page = String(query.page)
    }
    if (query.limit) {
      queryParams.limit = String(query.limit)
    }

    const queryString = new URLSearchParams(queryParams).toString()
    const endpoint = `/jobs${queryString ? `?${queryString}` : ''}`

    // Backend endpoint is public, but we can pass auth header if available
    const headers: Record<string, string> = {}
    if (authHeader) {
      headers.Authorization = authHeader
    }

    // Call backend API - returns { data: [...], meta: { pagination: {...} }, status: 200 }
    const backendResponse = await apiClient.get<Array<{
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
    }>>(endpoint, headers)

    // Map backend response data to frontend Job type
    const jobs: Job[] = backendResponse.data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      company: item.company,
      location: item.location || '',
      requirements: item.requirements || [],
      salary: item.salaryMin && item.salaryMax
        ? {
            min: Number(item.salaryMin),
            max: Number(item.salaryMax),
            currency: 'USD', // Default currency, backend might not have this field
          }
        : undefined,
      status: item.status.toLowerCase() as Job['status'], // DRAFT -> draft, PUBLISHED -> published, etc.
      candidates: item.applications
        ? {
            active: item.applications.filter((app) => app.status === 'PENDING' || app.status === 'REVIEWING').length,
            total: item.applications.length,
          }
        : undefined,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }))

    // Return in standard format with pagination from backend
    return {
      data: jobs,
      meta: backendResponse.meta, // Includes pagination info
      status: backendResponse.status,
    } as ApiResponse<Job[]>
  } catch (error) {
    console.error('Error in /api/jobs.get.ts:', error)
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to fetch jobs'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch jobs',
    })
  }
})
