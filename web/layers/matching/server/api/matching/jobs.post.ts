/**
 * Create/Parse Job from Text API
 * Server API route for creating or parsing job from text input
 */
import type { CreateJobInput, Job } from '@matching/types/matching'
import type { ApiResponse } from '../../../../../../types/api-response'

export default defineEventHandler(async (event): Promise<ApiResponse<Job>> => {
  const body = await readBody<{ description: string; link?: string }>(event)
  
  if (!body.description || body.description.trim().length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job description is required',
    })
  }

  // TODO: Implement AI parsing logic to extract job details from text
  // For now, return a basic job object
  const job: Job = {
    id: `job-${Date.now()}`,
    title: extractJobTitle(body.description) || 'Untitled Job',
    description: body.description,
    link: body.link,
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // TODO: Save to database
  // For now, just return the parsed job

  // Return in standard format
  return {
    data: job,
    meta: undefined,
    status: 200,
  } as ApiResponse<Job>
})

/**
 * Extract job title from description
 * Simple extraction - can be enhanced with AI
 */
function extractJobTitle(description: string): string | null {
  const lines = description.split('\n').filter(l => l.trim().length > 0)
  if (lines.length > 0) {
    const firstLine = lines[0].trim()
    // If first line is short and looks like a title, use it
    if (firstLine.length < 100 && !firstLine.includes('@')) {
      return firstLine
    }
  }
  return null
}

