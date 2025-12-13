/**
 * Job Utilities
 * Utility functions for job layer
 */
export const formatJobTitle = (title: string, company: string): string => {
  return `${title} at ${company}`
}

export const isJobActive = (startDate: Date, endDate?: Date): boolean => {
  const now = new Date()
  return now >= startDate && (!endDate || now <= endDate)
}

