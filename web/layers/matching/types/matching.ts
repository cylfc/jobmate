/**
 * Matching Types
 * TypeScript interfaces for matching layer
 */
export interface Job {
  id?: string
  title: string
  description: string
  company?: string
  domain?: string
  location?: string
  requirements?: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
  link?: string
  file?: File
  status: JobStatus
  createdAt?: Date
  updatedAt?: Date
}

export type JobStatus = 'draft' | 'published' | 'closed'

export interface Candidate {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  skills: string[]
  experience: number
  cvFile?: File
  status?: CandidateStatus
  createdAt?: Date
  updatedAt?: Date
}

export type CandidateStatus = 'active' | 'inactive' | 'archived'

export interface Matching {
  id: string
  candidateId: string
  jobId: string
  score: number
  status: MatchingStatus
  analysis?: MatchingAnalysis
  createdAt: Date
  updatedAt: Date
}

export type MatchingStatus = 'pending' | 'accepted' | 'rejected'

export interface MatchingAnalysis {
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  detailedScore: {
    skills: number
    experience: number
    education: number
    cultural: number
  }
}

export interface CreateJobInput {
  title: string
  description: string
  company?: string
  domain?: string
  location?: string
  requirements?: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
  link?: string
}

export interface CreateCandidateInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  skills: string[]
  experience: number
}

export interface CandidateFilter {
  status?: CandidateStatus
  skills?: string[]
  minExperience?: number
  maxExperience?: number
}
