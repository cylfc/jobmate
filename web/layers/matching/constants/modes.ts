/**
 * Input Mode Constants
 * Centralized constants for input modes used across matching components
 */

/**
 * Job Input Modes
 */
export const JOB_INPUT_MODE = {
  INPUT: 'input',
  UPLOAD: 'upload',
  LINK: 'link',
  DATABASE: 'database',
} as const

export type JobInputMode = typeof JOB_INPUT_MODE[keyof typeof JOB_INPUT_MODE]

/**
 * Candidate Input Modes
 */
export const CANDIDATE_INPUT_MODE = {
  INPUT: 'input',
  UPLOAD: 'upload',
  DATABASE: 'database',
} as const

export type CandidateInputMode = typeof CANDIDATE_INPUT_MODE[keyof typeof CANDIDATE_INPUT_MODE]

