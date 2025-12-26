/**
 * Create Candidate Types
 * TypeScript types for create candidate script feature
 */
import type { CreateCandidateInput } from '@candidate/types/candidate'
import type { Candidate } from '@candidate/types/candidate'

export type CreateCandidateInputMethod = 'text' | 'upload' | null

export interface CreateCandidateScriptData {
  inputMethod?: CreateCandidateInputMethod
  candidateText?: string
  files?: File[]
  parsedCandidate?: CreateCandidateInput
}

export interface CreateCandidateStepData {
  stepId: string
  data: any
}

export interface CreateCandidateState {
  // Current step index
  currentStep: number
  
  // Input method selected
  inputMethod: CreateCandidateInputMethod
  
  // Raw input data
  rawInput: {
    text?: string
    files?: File[]
  }
  
  // Parsed candidate data
  parsedCandidate: CreateCandidateInput | null
  
  // Validation errors
  errors: Record<string, string>
  
  // Loading states
  isParsing: boolean
  isSaving: boolean
  
  // Created candidate (after save)
  createdCandidate: Candidate | null
}

