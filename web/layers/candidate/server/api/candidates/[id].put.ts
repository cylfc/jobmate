/**
 * Update Candidate API
 * Server API route for updating a candidate by ID
 */
import type { Candidate, CreateCandidateInput } from '@candidate/types/candidate'

// Mock data store (should be replaced with database in production)
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

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<Partial<CreateCandidateInput> & { status?: Candidate['status'] }>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Candidate ID is required',
    })
  }

  // TODO: Implement actual database update
  const candidateIndex = mockCandidates.findIndex((c) => c.id === id)

  if (candidateIndex === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: `Candidate with ID ${id} not found`,
    })
  }

  const existingCandidate = mockCandidates[candidateIndex]

  // Update candidate with provided fields
  const updatedCandidate: Candidate = {
    ...existingCandidate,
    ...body,
    updatedAt: new Date(),
  }

  // Preserve fields that shouldn't be updated
  updatedCandidate.id = existingCandidate.id
  updatedCandidate.createdAt = existingCandidate.createdAt

  mockCandidates[candidateIndex] = updatedCandidate

  return {
    candidate: updatedCandidate,
  }
})

