/**
 * Get Job Filter Options API
 * Returns available options for job filters
 */
import type { JobFilterOptions, FilterOption } from '@job/types/job'
import { useApiClient } from '@auth/utils/api-client'

export default defineEventHandler(async (event): Promise<{ options: JobFilterOptions }> => {
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
        
        // Fetch all jobs to extract unique companies and locations
        const backendResponse = await apiClient.get<{
          items: Array<{
            company: string
            location?: string
          }>
        }>('/jobs?limit=1000', {
          Authorization: authHeader,
        })

        // Extract unique companies
        const companiesSet = new Set<string>()
        const locationsSet = new Set<string>()

        backendResponse.items.forEach((job) => {
          if (job.company) {
            companiesSet.add(job.company)
          }
          if (job.location) {
            locationsSet.add(job.location)
          }
        })

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

    return { options }
  } catch (error) {
    console.error('Error in /api/jobs/filter-options.get.ts:', error)
    // Return at least status options even if there's an error
    return {
      options: {
        status: [
          { label: 'Draft', value: 'draft' },
          { label: 'Published', value: 'published' },
          { label: 'Closed', value: 'closed' },
          { label: 'Archived', value: 'archived' },
        ],
        companies: [],
        locations: [],
      },
    }
  }
})

