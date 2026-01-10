/**
 * Job Utilities
 * Utility functions for job layer
 */
export const formatJobTitle = (title: string, company: string): string => {
  return `${title} at ${company}`;
};

export const isJobActive = (_startDate: Date, _endDate?: Date): boolean => {
  const now = new Date();
  return now >= _startDate && (!_endDate || now <= _endDate);
};
