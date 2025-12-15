/**
 * Get Jobs API
 * Server API route for fetching jobs
 */
import type { Job, JobFilter } from '@job/types/job'

// Mock data for jobs
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

/**
 * Get Jobs API
 * Server API route for fetching jobs
 */
export default defineEventHandler(async (event) => {
  const query = getQuery<JobFilter>(event)

  let jobs = [...mockJobs]

  if (query.search) {
    const searchTerm = query.search.toLowerCase()
    jobs = jobs.filter(j =>
      j.title.toLowerCase().includes(searchTerm) ||
      j.description.toLowerCase().includes(searchTerm) ||
      j.company.toLowerCase().includes(searchTerm)
    )
  }

  if (query.status) {
    jobs = jobs.filter(j => j.status === query.status)
  }

  if (query.company) {
    jobs = jobs.filter(j => j.company.toLowerCase().includes(query.company!.toLowerCase()))
  }

  if (query.location) {
    jobs = jobs.filter(j => j.location.toLowerCase().includes(query.location!.toLowerCase()))
  }

  return {
    jobs,
  }
})
