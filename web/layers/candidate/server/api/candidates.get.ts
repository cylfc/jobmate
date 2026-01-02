/**
 * Get Candidates API
 * Server API route for fetching candidates
 */
import { useApiClient } from '@auth/utils/api-client'
import type { Candidate, CandidateFilter } from '@candidate/types/candidate'
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

    const query = getQuery<CandidateFilter & { page?: string; limit?: string; sortBy?: string; sortOrder?: string }>(event)

    const apiClient = useApiClient()

    // Build query params for backend
    const queryParams = new URLSearchParams()
    if (query.search) queryParams.append('search', query.search)
    if (query.page) queryParams.append('page', query.page)
    if (query.limit) queryParams.append('limit', query.limit)
    if (query.sortBy) queryParams.append('sortBy', query.sortBy)
    if (query.sortOrder) queryParams.append('sortOrder', query.sortOrder)

    const queryString = queryParams.toString()
    const endpoint = `/candidates${queryString ? `?${queryString}` : ''}`

    // Call backend API - returns { data: [...], meta: { pagination: {...} }, status: 200 }
    const backendResponse = await apiClient.get<Array<{
      id: string
      email: string
      firstName: string
      lastName: string
      phone?: string
      resumeUrl?: string
      currentCompany?: string
      skills: string[]
      experience: Record<string, unknown>[]
      education: Record<string, unknown>[]
      currentSalary?: { amount: number; currency: string }
      expectedSalary?: { min: number; max: number; currency: string }
      educations?: unknown[]
      skillsDetailed?: unknown[]
      workExperiences?: unknown[]
      projects?: unknown[]
      userId?: string
      createdAt: string
      updatedAt: string
    }>>(endpoint, {
      Authorization: authHeader,
    })

    // Transform backend response data to frontend format
    const candidates: Candidate[] = backendResponse.data.map((backendCandidate) => {
      // Extract salary info - prefer direct fields, fallback to experience array
      let currentSalary: Candidate['currentSalary'] = backendCandidate.currentSalary
      let expectedSalary: Candidate['expectedSalary'] = backendCandidate.expectedSalary
      
      // Validate and normalize salary objects
      if (currentSalary && typeof currentSalary === 'object') {
        // Ensure it has the correct structure
        if (!('amount' in currentSalary) || !('currency' in currentSalary)) {
          currentSalary = undefined
        }
      }
      
      if (expectedSalary && typeof expectedSalary === 'object') {
        // Ensure it has the correct structure
        if (!('min' in expectedSalary) || !('max' in expectedSalary) || !('currency' in expectedSalary)) {
          expectedSalary = undefined
        }
      }
      
      // Fallback to experience array if direct fields not available
      if (!currentSalary || !expectedSalary) {
        if (Array.isArray(backendCandidate.experience)) {
          for (const exp of backendCandidate.experience) {
            if (exp.currentSalary && typeof exp.currentSalary === 'object' && !currentSalary) {
              const cs = exp.currentSalary as Record<string, unknown>
              if ('amount' in cs && 'currency' in cs) {
                currentSalary = cs as Candidate['currentSalary']
              }
            }
            if (exp.expectedSalary && typeof exp.expectedSalary === 'object' && !expectedSalary) {
              const es = exp.expectedSalary as Record<string, unknown>
              if ('min' in es && 'max' in es && 'currency' in es) {
                expectedSalary = es as Candidate['expectedSalary']
              }
            }
          }
        }
      }

      return {
        id: backendCandidate.id,
        firstName: backendCandidate.firstName,
        lastName: backendCandidate.lastName,
        email: backendCandidate.email,
        phone: backendCandidate.phone,
        skills: backendCandidate.skills || [],
        experience: Array.isArray(backendCandidate.experience) && backendCandidate.experience.length > 0
          ? (backendCandidate.experience.find((e) => e.years !== undefined) as { years?: number })?.years || 0
          : 0,
        currentCompany: backendCandidate.currentCompany,
        currentSalary,
        expectedSalary,
        status: 'active' as const,
        // Map detailed fields from backend response
        educations: Array.isArray(backendCandidate.educations) ? backendCandidate.educations as Candidate['educations'] : undefined,
        skillsDetailed: Array.isArray(backendCandidate.skillsDetailed) ? backendCandidate.skillsDetailed as Candidate['skillsDetailed'] : undefined,
        workExperiences: Array.isArray(backendCandidate.workExperiences) ? backendCandidate.workExperiences as Candidate['workExperiences'] : undefined,
        projects: Array.isArray(backendCandidate.projects) ? backendCandidate.projects as Candidate['projects'] : undefined,
        createdAt: new Date(backendCandidate.createdAt),
        updatedAt: new Date(backendCandidate.updatedAt),
      }
    })

    // Apply frontend filters (status, minExperience, maxExperience) if needed
    let filtered = candidates

    if (query.status) {
      filtered = filtered.filter((c) => c.status === query.status)
    }

    if (query.minExperience !== undefined) {
      filtered = filtered.filter((c) => c.experience >= query.minExperience!)
    }

    if (query.maxExperience !== undefined) {
      filtered = filtered.filter((c) => c.experience <= query.maxExperience!)
    }

    // Return in standard format with pagination from backend
    return {
      data: filtered,
      meta: backendResponse.meta, // Includes pagination info
      status: backendResponse.status,
    } as ApiResponse<Candidate[]>
  } catch (error) {
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to fetch candidates'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch candidates',
    })
  }
})
