/**
 * Get Candidates API
 * Server API route for fetching candidates
 */
import type { Candidate, CandidateFilter } from '@candidate/types/candidate'

export default defineEventHandler(async (event) => {
  const query = getQuery<CandidateFilter>(event)

  // TODO: Implement actual database query
  // Mock data for now
  const mockCandidates: Candidate[] = [
    {
      id: '1',
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      email: 'nguyenvana@example.com',
      phone: '+84 123 456 789',
      skills: ['React', 'Vue.js', 'TypeScript', 'Node.js'],
      experience: 5,
      currentCompany: 'Tech Solutions Inc.',
      expectedSalary: {
        min: 2000,
        max: 3000,
        currency: 'USD',
      },
      status: 'active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      firstName: 'Trần',
      lastName: 'Thị B',
      email: 'tranthib@example.com',
      phone: '+84 987 654 321',
      skills: ['Python', 'Django', 'PostgreSQL'],
      experience: 3,
      currentCompany: 'StartupXYZ',
      expectedSalary: {
        min: 1500,
        max: 2500,
        currency: 'USD',
      },
      status: 'active',
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20'),
    },
    {
      id: '3',
      firstName: 'Lê',
      lastName: 'Văn C',
      email: 'levanc@example.com',
      skills: ['Java', 'Spring Boot', 'MySQL'],
      experience: 7,
      currentCompany: 'Data Solutions',
      expectedSalary: {
        min: 2500,
        max: 3500,
        currency: 'USD',
      },
      status: 'inactive',
      createdAt: new Date('2024-03-10'),
      updatedAt: new Date('2024-03-10'),
    },
  ]

  let filtered = [...mockCandidates]

  // Apply filters
  if (query.search) {
    const search = query.search.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
    )
  }

  if (query.status) {
    filtered = filtered.filter((c) => c.status === query.status)
  }

  if (query.minExperience !== undefined) {
    filtered = filtered.filter((c) => c.experience >= query.minExperience!)
  }

  if (query.maxExperience !== undefined) {
    filtered = filtered.filter((c) => c.experience <= query.maxExperience!)
  }

  return {
    candidates: filtered,
  }
})
