/**
 * Use Candidate Composable
 * Composable for candidate-related functionality
 */
import type { Candidate, CreateCandidateInput, CandidateFilter } from '@candidate/types/candidate'

export const useCandidate = () => {
  const getCandidates = async (filters?: CandidateFilter) => {
    try {
      const response = await $fetch<{ candidates: Candidate[] }>('/api/candidates', {
        method: 'GET',
        query: filters,
      })
      return response.candidates || []
    } catch (error) {
      console.error('Error fetching candidates:', error)
      return []
    }
  }

  const getCandidateById = async (id: string): Promise<Candidate | null> => {
    try {
      const response = await $fetch<{ candidate: Candidate }>(`/api/candidates/${id}`, {
        method: 'GET',
      })
      return response.candidate || null
    } catch (error) {
      console.error('Error fetching candidate:', error)
      return null
    }
  }

  const createCandidate = async (input: CreateCandidateInput) => {
    try {
      const response = await $fetch<{ candidate: Candidate }>('/api/candidates', {
        method: 'POST',
        body: input,
      })
      return response.candidate
    } catch (error) {
      console.error('Error creating candidate:', error)
      throw error
    }
  }

  const updateCandidate = async (id: string, input: Partial<CreateCandidateInput> & { status?: Candidate['status'] }) => {
    try {
      const response = await $fetch<{ candidate: Candidate }>(`/api/candidates/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response.candidate
    } catch (error) {
      console.error('Error updating candidate:', error)
      throw error
    }
  }

  const deleteCandidate = async (id: string) => {
    try {
      await $fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      })
      return true
    } catch (error) {
      console.error('Error deleting candidate:', error)
      throw error
    }
  }

  const inviteCandidate = async (id: string) => {
    try {
      await $fetch(`/api/candidates/${id}/invite`, {
        method: 'POST',
      })
      return true
    } catch (error) {
      console.error('Error inviting candidate:', error)
      throw error
    }
  }

  /**
   * Parse candidate from text input using AI
   * Uses $fetch for client-side API call
   */
  const parseCandidateFromText = async (text: string): Promise<Candidate | null> => {
    try {
      const { candidate } = await $fetch<{ candidate: Candidate }>('/api/candidates/parse', {
        method: 'POST',
        body: { text },
      })
      return candidate
    } catch (error) {
      console.error('Error parsing candidate from text:', error)
      throw error
    }
  }

  return {
    getCandidates,
    getCandidateById,
    createCandidate,
    updateCandidate,
    deleteCandidate,
    inviteCandidate,
    parseCandidateFromText,
  }
}

