/**
 * Job Types
 * TypeScript types for job layer
 */
export interface Job {
  id: string
  title: string
  description: string
  company: string
  domain?: string
  location: string
  requirements: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
  link?: string
  status: JobStatus
  candidates?: {
    active: number // Số ứng viên đang ứng tuyển
    total: number // Tổng số đã nộp hồ sơ
  }
  createdAt: Date
  updatedAt: Date
}

export type JobStatus = 'draft' | 'published' | 'closed'

export interface CreateJobInput {
  title: string
  description: string
  company: string
  domain?: string
  location: string
  requirements: string[]
  salary?: {
    min: number
    max: number
    currency: string
  }
  link?: string
}

export interface JobFilter {
  search?: string
  status?: JobStatus
  company?: string
  location?: string
}

/**
 * Filter option types
 */
export interface FilterOption {
  label: string
  value: string | number
}

export interface JobFilterOptions {
  status: FilterOption[]
  companies?: FilterOption[]
  locations?: FilterOption[]
}
