/**
 * Create Candidate API
 * Server API route for creating a new candidate
 */
import { useApiClient } from '@shared/api'
import type { Candidate, CreateCandidateInput } from '@candidate/types/candidate'
import type { ApiResponse } from '@/types/api-response'
import { logError } from '@shared/logging'
import { candidateTransformer, type BackendCandidate } from '@shared/transformers'

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

    // Call backend API - returns { data, meta, status } format
    const backendResponse = await apiClient.post<BackendCandidate>('/candidates', createPayload, {
      Authorization: authHeader,
    })

    // Transform backend response to frontend format
    const candidate: Candidate = candidateTransformer.transform(backendResponse.data)

    // Return in standard format
    return {
      data: candidate,
      meta: undefined,
      status: backendResponse.status,
    } as ApiResponse<Candidate>
  } catch (error) {
    logError('Error in /api/candidates.post.ts', error, 'candidates.post')
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

