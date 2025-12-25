/**
 * Get Job by ID API
 * Server API route for fetching a single job by ID
 */
import type { Job } from '@job/types/job'

// Mock data for jobs (should be replaced with database in production)
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

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Job ID is required',
    })
  }

  // TODO: Implement actual database query
  const job = mockJobs.find((j) => j.id === id)

  if (!job) {
    throw createError({
      statusCode: 404,
      statusMessage: `Job with ID ${id} not found`,
    })
  }

  return {
    job,
  }
})

