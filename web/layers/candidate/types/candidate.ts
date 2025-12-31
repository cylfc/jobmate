/**
 * Candidate Types
 * TypeScript types for candidate layer
 */

// Education Entry
export interface EducationEntry {
  id?: string
  institution: string
  major?: string
  degreeType?: string
  startDate?: Date | string | import('@internationalized/date').CalendarDate
  endDate?: Date | string | import('@internationalized/date').CalendarDate
  gpa?: number
  gpaScale?: number
  description?: string
  orderIndex?: number
}

// Skill Entry
export interface SkillEntry {
  id?: string
  name: string
  skillType?: 'technical' | 'language' | 'soft' | 'certification'
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'native'
  yearsOfExperience?: number
  proficiencyPercentage?: number
  lastUsedDate?: Date | string | import('@internationalized/date').CalendarDate
  description?: string
  orderIndex?: number
}

// Work Experience Entry
export interface WorkExperienceEntry {
  id?: string
  companyName: string
  position: string
  role?: string
  startDate: Date | string | import('@internationalized/date').CalendarDate
  endDate?: Date | string | import('@internationalized/date').CalendarDate
  isCurrent?: boolean
  employmentType?: string
  location?: string
  description?: string
  achievements?: string[]
  technologiesUsed?: string[]
  orderIndex?: number
}

// Project Entry
export interface ProjectEntry {
  id?: string
  name: string
  company?: string
  startDate?: Date | string | import('@internationalized/date').CalendarDate
  endDate?: Date | string | import('@internationalized/date').CalendarDate
  isCurrent?: boolean
  position?: string
  role?: string
  description?: string
  achievements?: string[]
  technologiesUsed?: string[]
  projectUrl?: string
  orderIndex?: number
}

export interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  skills: string[] // Legacy - kept for backward compatibility
  experience: number // Legacy - kept for backward compatibility
  currentCompany?: string
  currentSalary?: {
    amount: number
    currency: string
  }
  expectedSalary?: {
    min: number
    max: number
    currency: string
  }
  status?: CandidateStatus
  // New detailed fields
  educations?: EducationEntry[]
  skillsDetailed?: SkillEntry[]
  workExperiences?: WorkExperienceEntry[]
  projects?: ProjectEntry[]
  createdAt: Date
  updatedAt: Date
}

export type CandidateStatus = 'active' | 'inactive' | 'archived'

export interface CreateCandidateInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  skills: string[] // Legacy - kept for backward compatibility
  experience?: number // Legacy - kept for backward compatibility
  currentCompany?: string
  currentSalary?: {
    amount: number
    currency: string
  }
  expectedSalary?: {
    min: number
    max: number
    currency: string
  }
  // New detailed fields
  educations?: EducationEntry[]
  skillsDetailed?: SkillEntry[]
  workExperiences?: WorkExperienceEntry[]
  projects?: ProjectEntry[]
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
