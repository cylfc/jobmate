/**
 * Create Job API
 * Server API route for creating a new job
 */
import type { Job, CreateJobInput } from '@job/types/job'

// In-memory store for simplicity
const jobs: Job[] = []

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateJobInput>(event)

  if (!body.title || !body.description || !body.company || !body.location) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Title, description, company, and location are required',
    })
  }

  const newJob: Job = {
    id: `j${jobs.length + 1}`,
    title: body.title,
    description: body.description,
    company: body.company,
    domain: body.domain,
    location: body.location,
    requirements: body.requirements || [],
    salary: body.salary,
    link: body.link,
    status: 'draft', // Default status
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  jobs.push(newJob)

  return { job: newJob }
})

