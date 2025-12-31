/**
 * Delete Candidate API
 * Server API route for deleting a candidate
 * Note: Candidate can only be deleted when there are no open applications
 */
import { useApiClient } from '@auth/utils/api-client'

// Application statuses that are considered "open" (not closed)
const OPEN_APPLICATION_STATUSES = ['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWED']

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

    // First, check if candidate has any open applications
    try {
      const applications = await apiClient.get<Array<{
        id: string
        status: string
        job: { id: string; title: string }
        candidate: { id: string }
        appliedAt: string
      }>>(`/applications/candidate/${id}`, {
        Authorization: authHeader,
      })

      // Check if there are any open applications
      // Handle both array and empty/undefined cases
      if (Array.isArray(applications) && applications.length > 0) {
        const openApplications = applications.filter((app) =>
          OPEN_APPLICATION_STATUSES.includes(app.status),
        )

        if (openApplications.length > 0) {
          throw createError({
            statusCode: 409,
            message: `Cannot delete candidate. There are ${openApplications.length} open application(s) associated with this candidate. Please close or reject all applications before deleting.`,
          })
        }
      }
      // If applications is empty array or undefined, it's fine - no applications exist
    } catch (error) {
      // If error is already a createError (like our 409), re-throw it
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as { statusCode: number }).statusCode
        // Re-throw our custom 409 error
        if (statusCode === 409) {
          throw error
        }
        // If it's a 404, candidate might not have applications, which is fine
        // Continue with deletion
        if (statusCode === 404) {
          // Candidate not found or no applications - continue with deletion
        } else {
          // Other errors should be re-thrown
          throw error
        }
      } else {
        // Unknown error, re-throw
        throw error
      }
    }

    // If no open applications, proceed with deletion
    await apiClient.delete(`/candidates/${id}`, {
      Authorization: authHeader,
    })

    return {
      success: true,
      message: 'Candidate deleted successfully',
    }
  } catch (error) {
    // Handle backend errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode
      const message = ('message' in error && typeof error.message === 'string')
        ? error.message
        : 'Failed to delete candidate'

      throw createError({
        statusCode,
        message,
      })
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to delete candidate',
    })
  }
})

