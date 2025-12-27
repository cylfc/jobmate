/**
 * Use Matching Job Composable
 * Wrapper for job-related API operations
 * Stateless wrapper - uses API from utils
 */
import { useMatchingApi } from '@matching/utils/matching-api'

export const useMatchingJob = () => {
  const api = useMatchingApi()

  return {
    parseJobFromText: api.parseJobFromText,
    getJobsFromDatabase: api.getJobsFromDatabase,
    saveJob: api.saveJob,
  }
}

