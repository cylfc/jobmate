/**
 * Update Candidate API
 * Server API route for updating a candidate by ID
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

    const id = getRouterParam(event, 'id')
    const body = await readBody<Partial<CreateCandidateInput> & { status?: Candidate['status'] }>(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Candidate ID is required',
      })
    }

    const apiClient = useApiClient()

    // Build update payload
    const updatePayload: Record<string, unknown> = {}
    if (body.firstName !== undefined) updatePayload.firstName = body.firstName
    if (body.lastName !== undefined) updatePayload.lastName = body.lastName
    if (body.email !== undefined) updatePayload.email = body.email
    if (body.phone !== undefined) updatePayload.phone = body.phone
    if (body.skills !== undefined) updatePayload.skills = body.skills
    if (body.currentCompany !== undefined) updatePayload.currentCompany = body.currentCompany
    
    // Transform experience from number to array format for backend
    if (body.experience !== undefined && body.experience !== null) {
      updatePayload.experience = [{ years: body.experience }]
    }
    
    // Add salary fields directly if provided
    if (body.currentSalary !== undefined) {
      updatePayload.currentSalary = body.currentSalary
    }
    if (body.expectedSalary !== undefined) {
      updatePayload.expectedSalary = body.expectedSalary
    }
    
    // Add detailed fields if provided
    if (body.educations !== undefined) {
      updatePayload.educations = body.educations
    }
    if (body.skillsDetailed !== undefined) {
      updatePayload.skillsDetailed = body.skillsDetailed
    }
    if (body.workExperiences !== undefined) {
      updatePayload.workExperiences = body.workExperiences
    }
    if (body.projects !== undefined) {
      updatePayload.projects = body.projects
    }

    // Call backend API
    const backendCandidate = await apiClient.patch<{
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
    }>(`/candidates/${id}`, updatePayload, {
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
      status: body.status || 'active',
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
        : 'Failed to update candidate'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update candidate',
    })
  }
})

