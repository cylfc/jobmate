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
  status?: CandidateStatus
  createdAt: Date
  updatedAt: Date
}

export type CandidateStatus = 'active' | 'inactive' | 'archived'

export interface CreateCandidateInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  skills: string[]
  experience?: number
}

export interface CandidateFilter {
  search?: string
  status?: CandidateStatus
  minExperience?: number
  maxExperience?: number
}

