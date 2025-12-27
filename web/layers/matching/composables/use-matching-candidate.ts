/**
 * Use Matching Candidate Composable
 * Wrapper for candidate-related API operations
 * Stateless wrapper - uses API from utils
 */
import { useMatchingApi } from '@matching/utils/matching-api'

export const useMatchingCandidate = () => {
  const api = useMatchingApi()

  return {
    parseCandidatesFromText: api.parseCandidatesFromText,
    getCandidatesFromDatabase: api.getCandidatesFromDatabase,
    saveCandidate: api.saveCandidate,
  }
}

