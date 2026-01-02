/**
 * Get Job Filter Options API
 * Returns available options for job filters
 */
import type { JobFilterOptions, FilterOption } from '@job/types/job'
import { useApiClient } from '@auth/utils/api-client'
import type { ApiResponse } from '../../../../../../types/api-response'

export default defineEventHandler(async (event): Promise<ApiResponse<JobFilterOptions>> => {
  try {
    const authHeader = getHeader(event, 'authorization')
    
    // Status options are fixed based on backend enum
    const statusOptions: FilterOption[] = [
      { label: 'Draft', value: 'draft' },
      { label: 'Published', value: 'published' },
      { label: 'Closed', value: 'closed' },
      { label: 'Archived', value: 'archived' },
    ]

    let companiesOptions: FilterOption[] = []
    let locationsOptions: FilterOption[] = []

    // Try to fetch from backend if auth header is available
    if (authHeader) {
      try {
        const apiClient = useApiClient()
        
        // Fetch jobs in batches to extract unique companies and locations
        // Backend has a max limit of 100, so we'll fetch multiple pages if needed
        const companiesSet = new Set<string>()
        const locationsSet = new Set<string>()
        const limit = 100 // Max allowed by backend
        let page = 1
        let hasMore = true

        while (hasMore) {
          // Call backend API - returns { data: [...], meta: { pagination: {...} }, status: 200 }
          const backendResponse = await apiClient.get<Array<{
            company: string
            location?: string
          }>>(`/jobs?limit=${limit}&page=${page}`, {
            Authorization: authHeader,
          })

          // Extract unique companies and locations from this batch
          backendResponse.data.forEach((job) => {
            if (job.company) {
              companiesSet.add(job.company)
            }
            if (job.location) {
              locationsSet.add(job.location)
            }
          })

          // Check if there are more pages
          const pagination = backendResponse.meta?.pagination
          hasMore = pagination ? page < pagination.totalPages : false
          page++

          // Limit to first 5 pages (500 jobs max) to avoid too many requests
          if (page > 5) {
            break
          }
        }

        companiesOptions = Array.from(companiesSet)
          .sort()
          .map((company) => ({
            label: company,
            value: company.toLowerCase().replace(/\s+/g, '-'),
          }))

        locationsOptions = Array.from(locationsSet)
          .sort()
          .map((location) => ({
            label: location,
            value: location.toLowerCase().replace(/\s+/g, '-'),
          }))
      } catch (error) {
        console.warn('Failed to fetch companies and locations from backend, using empty arrays:', error)
        // Continue with empty arrays if fetch fails
      }
    }

    const options: JobFilterOptions = {
      status: statusOptions,
      companies: companiesOptions,
      locations: locationsOptions,
    }

    // Return in standard format
    return {
      data: options,
      meta: undefined,
      status: 200,
    } as ApiResponse<JobFilterOptions>
  } catch (error) {
    console.error('Error in /api/jobs/filter-options.get.ts:', error)
    // Return at least status options even if there's an error
    return {
      data: {
        status: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'Closed', value: 'closed' },
          { label: 'Archived', value: 'archived' },
        ],
        companies: [],
        locations: [],
      },
      meta: undefined,
      status: 200,
    } as ApiResponse<JobFilterOptions>
  }
})

