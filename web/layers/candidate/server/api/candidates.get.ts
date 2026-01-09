/**
 * Get Candidates API
 * Server API route for fetching candidates
 */
import { useApiClient } from '@shared/api'
import type { Candidate, CandidateFilter } from '@candidate/types/candidate'
import type { ApiResponse } from '../../../../../../types/api-response'
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
    const backendResponse = await apiClient.get<BackendCandidate[]>(endpoint, {
      Authorization: authHeader,
    })

    // Transform backend response data to frontend format
    const candidates: Candidate[] = candidateTransformer.transformMany(backendResponse.data)

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
