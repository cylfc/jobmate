/**
 * Use Candidate List Composable
 * Shared composable for managing candidate list state within the candidate module
 * Uses Layer 2: createSharedComposable for module-scoped state
 */
import { createSharedComposable } from '@vueuse/core'
import type { Candidate, CandidateFilter } from '@candidate/types/candidate'
import { useCandidate } from '@candidate/composables/use-candidate'

const _useCandidateList = () => {
  const candidates = ref<Candidate[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const candidateOps = useCandidate()
  
  /**
   * Fetch candidates with optional filters
   */
  const fetchCandidates = async (filters?: CandidateFilter) => {
    loading.value = true
    error.value = null
    try {
      const data = await candidateOps.getCandidates(filters)
      candidates.value = data
      return data
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch candidates'
      error.value = errorMessage
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Refresh candidates with current filters
   * Note: This will use empty filters. For filtered refresh, use fetchCandidates with filters.
   */
  const refresh = async (filters?: CandidateFilter) => {
    return await fetchCandidates(filters)
  }
  
  /**
   * Reset all state
   */
  const reset = () => {
    candidates.value = []
    loading.value = false
    error.value = null
  }
  
  /**
   * Add a candidate to the list (optimistic update)
   */
  const addCandidate = (candidate: Candidate) => {
    candidates.value = [candidate, ...candidates.value]
  }
  
  /**
   * Update a candidate in the list
   */
  const updateCandidateInList = (updatedCandidate: Candidate) => {
    const index = candidates.value.findIndex(c => c.id === updatedCandidate.id)
    if (index !== -1) {
      candidates.value[index] = updatedCandidate
    }
  }
  
  /**
   * Remove a candidate from the list
   */
  const removeCandidate = (candidateId: string) => {
    candidates.value = candidates.value.filter(c => c.id !== candidateId)
  }
  
  /**
   * Remove multiple candidates from the list
   */
  const removeCandidates = (candidateIds: string[]) => {
    candidates.value = candidates.value.filter(c => !candidateIds.includes(c.id))
  }
  
  return {
    // Readonly state - prevent external mutation
    candidates: readonly(candidates),
    loading: readonly(loading),
    error: readonly(error),
    // Actions
    fetchCandidates,
    refresh,
    reset,
    addCandidate,
    updateCandidateInList,
    removeCandidate,
    removeCandidates,
  }
}

export const useCandidateList = createSharedComposable(_useCandidateList)

