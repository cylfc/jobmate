/**
 * Candidate Input Mode Constants
 * Constants for candidate input modes in create modal
 */

export const CANDIDATE_CREATE_MODE = {
  INPUT: 'input',
  UPLOAD: 'upload',
  DATABASE: 'database',
  FORM: 'form',
} as const

export type CandidateCreateMode = typeof CANDIDATE_CREATE_MODE[keyof typeof CANDIDATE_CREATE_MODE]

