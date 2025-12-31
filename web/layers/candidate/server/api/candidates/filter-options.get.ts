/**
 * Get Candidate Filter Options API
 * Returns available options for candidate filters
 * Calculated from actual candidate data
 */
import { useApiClient } from '@auth/utils/api-client'
import type { CandidateFilterOptions, FilterOption } from '@candidate/types/candidate'

export default defineEventHandler(async (event): Promise<{ options: CandidateFilterOptions }> => {
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

    // Fetch all candidates to calculate filter options
    const backendResponse = await apiClient.get<{
      items: Array<{
        skills: string[]
        experience: Record<string, unknown>[]
        currentCompany?: string
      }>
      total: number
    }>('/candidates?limit=1000', {
      Authorization: authHeader,
    })

    // Status options (static)
    const statusOptions: FilterOption[] = [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Archived', value: 'archived' },
    ]

    // Calculate experience range from actual data
    const experiences: number[] = []
    backendResponse.items.forEach((candidate) => {
      if (Array.isArray(candidate.experience) && candidate.experience.length > 0) {
        const exp = candidate.experience.find((e) => e.years !== undefined) as { years?: number }
        if (exp?.years !== undefined) {
          experiences.push(exp.years)
        }
      }
    })

    const experienceRange = {
      min: experiences.length > 0 ? Math.min(...experiences) : 0,
      max: experiences.length > 0 ? Math.max(...experiences) : 30,
      step: 1,
    }

    // Extract unique skills from all candidates
    const skillsSet = new Set<string>()
    backendResponse.items.forEach((candidate) => {
      if (Array.isArray(candidate.skills)) {
        candidate.skills.forEach((skill) => {
          if (skill && typeof skill === 'string') {
            skillsSet.add(skill)
          }
        })
      }
    })

    const skillsOptions: FilterOption[] = Array.from(skillsSet)
      .sort()
      .map((skill) => ({
        label: skill,
        value: skill.toLowerCase().replace(/\s+/g, '-'),
      }))

    // Extract unique companies from all candidates
    const companiesSet = new Set<string>()
    backendResponse.items.forEach((candidate) => {
      if (candidate.currentCompany && typeof candidate.currentCompany === 'string') {
        companiesSet.add(candidate.currentCompany)
      }
    })

    const companiesOptions: FilterOption[] = Array.from(companiesSet)
      .sort()
      .map((company) => ({
        label: company,
        value: company.toLowerCase().replace(/\s+/g, '-'),
      }))

    const options: CandidateFilterOptions = {
      status: statusOptions,
      experienceRange,
      skills: skillsOptions,
      companies: companiesOptions,
    }

    return { options }
  } catch {
    // If error fetching candidates, return default/mock options
    // This ensures the UI still works even if backend is unavailable
    const statusOptions: FilterOption[] = [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Archived', value: 'archived' },
    ]

    const experienceRange = {
      min: 0,
      max: 30,
      step: 1,
    }

    const skillsOptions: FilterOption[] = []
    const companiesOptions: FilterOption[] = []

    return {
      options: {
        status: statusOptions,
        experienceRange,
        skills: skillsOptions,
        companies: companiesOptions,
      },
    }
  }
})

