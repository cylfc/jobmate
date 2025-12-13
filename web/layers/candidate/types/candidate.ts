/**
 * Candidate Types
 * TypeScript types for candidate layer
 */
export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  skills: string[]
  experience: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateCandidateInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  skills: string[]
}

