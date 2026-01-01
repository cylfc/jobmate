/**
 * Create Candidate API
 * Server API route for creating a new candidate
 */
import { useApiClient } from '@auth/utils/api-client'
import type { Candidate, CreateCandidateInput } from '@candidate/types/candidate'

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

    const body = await readBody<CreateCandidateInput>(event)

    const apiClient = useApiClient()

    // Prepare experience data with salary info
    const experienceData: Record<string, unknown>[] = []
    if (body.experience) {
      experienceData.push({ years: body.experience })
    }
    // Add salary info to experience if provided
    if (body.currentSalary || body.expectedSalary) {
      const salaryInfo: Record<string, unknown> = {}
      if (body.currentSalary) {
        salaryInfo.currentSalary = body.currentSalary
      }
      if (body.expectedSalary) {
        salaryInfo.expectedSalary = body.expectedSalary
      }
      if (Object.keys(salaryInfo).length > 0) {
        experienceData.push(salaryInfo)
      }
    }

    // Build create payload
    const createPayload: Record<string, unknown> = {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      skills: body.skills || [],
      experience: experienceData.length > 0 ? experienceData : [],
    }

    // Add currentCompany if provided
    if (body.currentCompany) {
      createPayload.currentCompany = body.currentCompany
    }

    // Add salary fields directly if provided (backend will handle them)
    if (body.currentSalary) {
      createPayload.currentSalary = body.currentSalary
    }
    if (body.expectedSalary) {
      createPayload.expectedSalary = body.expectedSalary
    }

    // Add detailed fields if provided
    if (body.educations !== undefined) {
      createPayload.educations = body.educations
    }
    if (body.skillsDetailed !== undefined) {
      createPayload.skillsDetailed = body.skillsDetailed
    }
    if (body.workExperiences !== undefined) {
      createPayload.workExperiences = body.workExperiences
    }
    if (body.projects !== undefined) {
      createPayload.projects = body.projects
    }

    // Call backend API
    const backendCandidate = await apiClient.post<{
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
    }>('/candidates', createPayload, {
      Authorization: authHeader,
    })

    // Extract salary info - prefer direct fields, fallback to experience array
    let currentSalary: Candidate['currentSalary'] = backendCandidate.currentSalary
    let expectedSalary: Candidate['expectedSalary'] = backendCandidate.expectedSalary
    
    // Fallback to experience array if direct fields not available
    if (!currentSalary || !expectedSalary) {
      if (Array.isArray(backendCandidate.experience)) {
        for (const exp of backendCandidate.experience) {
          if (exp.currentSalary && typeof exp.currentSalary === 'object' && !currentSalary) {
            currentSalary = exp.currentSalary as Candidate['currentSalary']
          }
          if (exp.expectedSalary && typeof exp.expectedSalary === 'object' && !expectedSalary) {
            expectedSalary = exp.expectedSalary as Candidate['expectedSalary']
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
      status: 'active',
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
        : 'Failed to create candidate'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to create candidate',
    })
  }
})

