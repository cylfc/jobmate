/**
 * Candidate Transformer
 * Transforms backend Candidate entities to frontend Candidate types
 */

import type { Candidate } from '@candidate/types/candidate'
import { BaseTransformer } from './base-transformer'

/**
 * Backend Candidate type (from API response)
 */
export interface BackendCandidate {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  resumeUrl?: string
  currentCompany?: string
  skills: string[]
  experience: Record<string, unknown>[]
  education: Record<string, unknown>[]
  currentSalary?: { amount: number; currency: string }
  expectedSalary?: { min: number; max: number; currency: string }
  educations?: unknown[]
  skillsDetailed?: unknown[]
  workExperiences?: unknown[]
  projects?: unknown[]
  userId?: string
  createdAt: string
  updatedAt: string
}

export class CandidateTransformer extends BaseTransformer<BackendCandidate, Candidate> {
  /**
   * Transform backend candidate to frontend candidate
   */
  transform(backend: BackendCandidate): Candidate {
    // Extract salary info - prefer direct fields, fallback to experience array
    let currentSalary: Candidate['currentSalary'] = backend.currentSalary
    let expectedSalary: Candidate['expectedSalary'] = backend.expectedSalary
    
    // Validate and normalize salary objects
    if (currentSalary && typeof currentSalary === 'object') {
      // Ensure it has the correct structure
      if (!('amount' in currentSalary) || !('currency' in currentSalary)) {
        currentSalary = undefined
      }
    }
    
    if (expectedSalary && typeof expectedSalary === 'object') {
      // Ensure it has the correct structure
      if (!('min' in expectedSalary) || !('max' in expectedSalary) || !('currency' in expectedSalary)) {
        expectedSalary = undefined
      }
    }
    
    // Fallback to experience array if direct fields not available
    if (!currentSalary || !expectedSalary) {
      if (Array.isArray(backend.experience)) {
        for (const exp of backend.experience) {
          if (exp.currentSalary && typeof exp.currentSalary === 'object' && !currentSalary) {
            const cs = exp.currentSalary as Record<string, unknown>
            if ('amount' in cs && 'currency' in cs) {
              currentSalary = cs as Candidate['currentSalary']
            }
          }
          if (exp.expectedSalary && typeof exp.expectedSalary === 'object' && !expectedSalary) {
            const es = exp.expectedSalary as Record<string, unknown>
            if ('min' in es && 'max' in es && 'currency' in es) {
              expectedSalary = es as Candidate['expectedSalary']
            }
          }
        }
      }
    }

    return {
      id: backend.id,
      firstName: backend.firstName,
      lastName: backend.lastName,
      email: backend.email,
      phone: backend.phone,
      skills: backend.skills || [],
      experience: Array.isArray(backend.experience) && backend.experience.length > 0
        ? (backend.experience.find((e) => e.years !== undefined) as { years?: number })?.years || 0
        : 0,
      currentCompany: backend.currentCompany,
      currentSalary,
      expectedSalary,
      status: 'active' as const,
      // Map detailed fields from backend response
      educations: Array.isArray(backend.educations) ? backend.educations as Candidate['educations'] : undefined,
      skillsDetailed: Array.isArray(backend.skillsDetailed) ? backend.skillsDetailed as Candidate['skillsDetailed'] : undefined,
      workExperiences: Array.isArray(backend.workExperiences) ? backend.workExperiences as Candidate['workExperiences'] : undefined,
      projects: Array.isArray(backend.projects) ? backend.projects as Candidate['projects'] : undefined,
      createdAt: new Date(backend.createdAt),
      updatedAt: new Date(backend.updatedAt),
    }
  }
}

// Export singleton instance
export const candidateTransformer = new CandidateTransformer()
