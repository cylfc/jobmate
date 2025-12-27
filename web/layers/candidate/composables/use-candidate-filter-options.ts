/**
 * Use Candidate Filter Options Composable
 * Manages filter options state for candidate filters
 * Uses Layer 2: createSharedComposable for module-scoped state
 */
import { createSharedComposable } from '@vueuse/core'
import type { CandidateFilterOptions, FilterOption } from '@candidate/types/candidate'
import { useCandidate } from '@candidate/utils/candidate-api'

const _useCandidateFilterOptions = () => {
  const options = ref<CandidateFilterOptions | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const candidateOps = useCandidate()
  
  /**
   * Fetch filter options from API
   */
  const fetchOptions = async () => {
    // Return cached options if already loaded
    if (options.value) {
      return options.value
    }
    
    loading.value = true
    error.value = null
    try {
      const data = await candidateOps.getFilterOptions()
      options.value = data
      return data
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch filter options'
      error.value = errorMessage
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Get status options
   */
  const statusOptions = computed<FilterOption[]>(() => {
    return options.value?.status || []
  })
  
  /**
   * Get experience range
   */
  const experienceRange = computed(() => {
    return options.value?.experienceRange || { min: 0, max: 30, step: 1 }
  })
  
  /**
   * Get skills options
   */
  const skillsOptions = computed<FilterOption[]>(() => {
    return options.value?.skills || []
  })
  
  /**
   * Get companies options
   */
  const companiesOptions = computed<FilterOption[]>(() => {
    return options.value?.companies || []
  })
  
  /**
   * Reset options (clear cache)
   */
  const reset = () => {
    options.value = null
    loading.value = false
    error.value = null
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
    options,
    loading,
    error,
    // Computed options
    statusOptions,
    experienceRange,
    skillsOptions,
    companiesOptions,
    // Actions
    fetchOptions,
    reset,
  }
}

export const useCandidateFilterOptions = createSharedComposable(_useCandidateFilterOptions)

