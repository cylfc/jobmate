/**
 * Candidate Utilities
 * Utility functions for candidate layer
 */
export const formatCandidateName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim()
}

export const getCandidateExperience = (startDate: Date, endDate?: Date): number => {
  // TODO: Implement experience calculation
  return 0
}

