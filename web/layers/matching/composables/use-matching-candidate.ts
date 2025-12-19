/**
 * Use Matching Candidate Composable
 * Handles all candidate-related operations for matching
 */
import type { Candidate, CreateCandidateInput, CandidateFilter } from '@matching/types/matching'

export const useMatchingCandidate = () => {
  /**
   * Parse candidates from text input
   * Uses $fetch for client-side API call
   */
  const parseCandidatesFromText = async (text: string): Promise<Candidate[]> => {
    try {
      const { candidates } = await $fetch<{ candidates: Candidate[] }>('/api/matching/candidates', {
        method: 'POST',
        body: {
          text,
        },
      })
      return candidates
    } catch (error) {
      console.error('Error parsing candidates from text:', error)
      throw error
    }
  }

  /**
   * Get candidates from database with filters
   * Uses useAsyncData for SSR-safe data fetching
   */
  const getCandidatesFromDatabase = async (filters?: CandidateFilter): Promise<Candidate[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (filters?.status) queryParams.append('status', filters.status)
      if (filters?.minExperience !== undefined) queryParams.append('minExperience', filters.minExperience.toString())
      if (filters?.maxExperience !== undefined) queryParams.append('maxExperience', filters.maxExperience.toString())
      if (filters?.skills && filters.skills.length > 0) {
        filters.skills.forEach((skill: string) => queryParams.append('skills', skill))
      }

      const queryString = queryParams.toString()
      const url = `/api/matching/candidates${queryString ? `?${queryString}` : ''}`

      const { data } = await useAsyncData(`matching:candidates:${queryString}`, () =>
        $fetch<{ candidates: Candidate[] }>(url, {
          method: 'GET',
        })
      )

      return data.value?.candidates || []
    } catch (error) {
      console.error('Error fetching candidates from database:', error)
      return []
    }
  }

  /**
   * Save candidate to database
   * Uses $fetch for client-side API call
   */
  const saveCandidate = async (candidateInput: CreateCandidateInput): Promise<Candidate | null> => {
    try {
      // TODO: Implement save candidate API endpoint
      // For now, return a mock candidate
      const candidate: Candidate = {
        id: `candidate-${Date.now()}`,
        ...candidateInput,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      return candidate
    } catch (error) {
      console.error('Error saving candidate:', error)
      return null
    }
  }

  return {
    parseCandidatesFromText,
    getCandidatesFromDatabase,
    saveCandidate,
  }
}

