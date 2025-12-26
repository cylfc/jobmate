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
  currentCompany?: string
  expectedSalary?: {
    min: number
    max: number
    currency: string
  }
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
  currentCompany?: string
  expectedSalary?: {
    min: number
    max: number
    currency: string
  }
}

export interface CandidateFilter {
  search?: string
  status?: CandidateStatus
  minExperience?: number
  maxExperience?: number
}

/**
 * Filter option types
 */
export interface FilterOption {
  label: string
  value: string | number
}

export interface CandidateFilterOptions {
  status: FilterOption[]
  experienceRange: {
    min: number
    max: number
    step?: number
  }
  skills?: FilterOption[]
  companies?: FilterOption[]
}
