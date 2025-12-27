/**
 * Use Candidate List Composable
 * Shared composable for managing candidate list state within the candidate module
 * Uses Layer 2: createSharedComposable for module-scoped state
 */
import { createSharedComposable } from '@vueuse/core'
import type { Candidate, CandidateFilter } from '@candidate/types/candidate'
import { useCandidate } from '@candidate/utils/candidate-api'

const _useCandidateList = () => {
  const candidates = reactive<Candidate[]>([])
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
      candidates.splice(0, candidates.length, ...data)
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
    candidates.splice(0, candidates.length)
    loading.value = false
    error.value = null
  }
  
  /**
   * Add a candidate to the list (optimistic update)
   */
  const addCandidate = (candidate: Candidate) => {
    candidates.unshift(candidate)
  }
  
  /**
   * Update a candidate in the list
   */
  const updateCandidateInList = (updatedCandidate: Candidate) => {
    const index = candidates.findIndex(c => c.id === updatedCandidate.id)
    if (index !== -1) {
      candidates[index] = updatedCandidate
    }
  }
  
  /**
   * Remove a candidate from the list
   */
  const removeCandidate = (candidateId: string) => {
    const index = candidates.findIndex(c => c.id === candidateId)
    if (index !== -1) {
      candidates.splice(index, 1)
    }
  }
  
  /**
   * Remove multiple candidates from the list
   */
  const removeCandidates = (candidateIds: string[]) => {
    candidateIds.forEach(id => {
      const index = candidates.findIndex(c => c.id === id)
      if (index !== -1) {
        candidates.splice(index, 1)
      }
    })
  }
  
  // Auto-cleanup on unmount (optional - only if component unmounts)
  // Note: Shared composable may be used by multiple components,
  // so cleanup is optional and should be called explicitly if needed
  onUnmounted(() => {
    // Optional: Reset state when all components using this composable unmount
    // Uncomment if you want auto-cleanup:
    // reset()
  })
  
  return {
    candidates,
    loading,
    error,
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

