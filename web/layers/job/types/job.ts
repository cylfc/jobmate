/**
 * Job Types
 * TypeScript types for job layer
 */
export interface Job {
  id: string
  title: string
  description: string
  company: string
  location: string
  requirements: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
  status: JobStatus
  createdAt: Date
  updatedAt: Date
}

export type JobStatus = 'draft' | 'published' | 'closed'

export interface CreateJobInput {
  title: string
  description: string
  company: string
  location: string
  requirements: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
}

