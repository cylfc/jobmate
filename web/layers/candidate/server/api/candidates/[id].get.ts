/**
 * Get Candidate by ID API
 * Server API route for fetching a single candidate by ID
 */
import { useApiClient } from '@auth/utils/api-client'
import type { Candidate } from '@candidate/types/candidate'

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

    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Candidate ID is required',
      })
    }

    const apiClient = useApiClient()

    // Call backend API
    const backendCandidate = await apiClient.get<{
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
    }>(`/candidates/${id}`, {
      Authorization: authHeader,
    })

    // Extract salary info - prefer direct fields, fallback to experience array
    let currentSalary: Candidate['currentSalary'] = backendCandidate.currentSalary
    let expectedSalary: Candidate['expectedSalary'] = backendCandidate.expectedSalary
    
    // Validate and normalize salary objects
    if (currentSalary && typeof currentSalary === 'object') {
      if (!('amount' in currentSalary) || !('currency' in currentSalary)) {
        currentSalary = undefined
      }
    }
    
    if (expectedSalary && typeof expectedSalary === 'object') {
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

    // Transform backend response to frontend format
    const candidate: Candidate = {
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

    return {
      candidate,
    }
  } catch (error) {
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to fetch candidate'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch candidate',
    })
  }
})

