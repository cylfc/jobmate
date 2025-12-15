/**
 * Delete Job API
 * Server API route for deleting a job by ID
 */
import type { Job } from '@job/types/job'

// In-memory store for simplicity (should be a database in real app)
const jobs: Job[] = [] // Assume this is populated from a mock or actual DB

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job ID is required',
    })
  }

  const index = jobs.findIndex(j => j.id === id)

  if (index === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: `Job with ID ${id} not found`,
    })
  }

  jobs.splice(index, 1)

  return { status: 'OK' }
})

