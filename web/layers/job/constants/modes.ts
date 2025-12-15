/**
 * Job Create Mode Constants
 * Constants for job input modes in create modal
 */

export const JOB_CREATE_MODE = {
  INPUT: 'input',
  UPLOAD: 'upload',
  FORM: 'form',
} as const

export type JobCreateMode = typeof JOB_CREATE_MODE[keyof typeof JOB_CREATE_MODE]

