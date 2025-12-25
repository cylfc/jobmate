/**
 * Update Job API
 * Server API route for updating a job by ID
 */
import type { Job, CreateJobInput } from '@job/types/job'

// Mock data store (should be replaced with database in production)
const mockJobs: Job[] = [
  {
    id: 'j1',
    title: 'Senior Frontend Developer',
    description: 'We are looking for an experienced Frontend Developer to join our team.',
    company: 'Tech Corp',
    domain: 'Technology',
    location: 'Ho Chi Minh City',
    requirements: ['Vue.js', 'TypeScript', '5+ years experience'],
    salary: {
      min: 2000,
      max: 3000,
      currency: 'USD',
    },
    status: 'published',
    candidates: {
      active: 5,
      total: 12,
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'j2',
    title: 'Full Stack Developer',
    description: 'Join our team as a Full Stack Developer working with modern technologies.',
    company: 'StartupXYZ',
    domain: 'Technology',
    location: 'Hanoi',
    requirements: ['React', 'Node.js', 'MongoDB', '3+ years experience'],
    salary: {
      min: 1500,
      max: 2500,
      currency: 'USD',
    },
    status: 'published',
    candidates: {
      active: 8,
      total: 20,
    },
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    id: 'j3',
    title: 'Backend Developer',
    description: 'We need a skilled Backend Developer to build scalable APIs.',
    company: 'Data Solutions',
    domain: 'Technology',
    location: 'Da Nang',
    requirements: ['Python', 'Django', 'PostgreSQL', '4+ years experience'],
    status: 'draft',
    candidates: {
      active: 0,
      total: 3,
    },
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
  },
]

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<Partial<CreateJobInput> & { status?: Job['status'] }>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job ID is required',
    })
  }

  // TODO: Implement actual database update
  const jobIndex = mockJobs.findIndex((j) => j.id === id)

  if (jobIndex === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: `Job with ID ${id} not found`,
    })
  }

  const existingJob = mockJobs[jobIndex]

  // Update job with provided fields
  const updatedJob: Job = {
    ...existingJob,
    ...body,
    updatedAt: new Date(),
  }

  // Preserve fields that shouldn't be updated
  updatedJob.id = existingJob.id
  updatedJob.createdAt = existingJob.createdAt
  // Preserve candidates count if not provided
  if (!body.candidates) {
    updatedJob.candidates = existingJob.candidates
  }

  mockJobs[jobIndex] = updatedJob

  return {
    job: updatedJob,
  }
})

