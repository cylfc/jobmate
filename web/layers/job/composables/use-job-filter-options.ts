/**
 * Use Job Filter Options Composable
 * Manages filter options state for job filters
 * Uses Layer 2: createSharedComposable for module-scoped state
 */
import { createSharedComposable } from '@vueuse/core'
import type { JobFilterOptions, FilterOption } from '@job/types/job'
import { useJob } from '@job/utils/job-api'

const _useJobFilterOptions = () => {
  const options = ref<JobFilterOptions | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const jobOps = useJob()
  
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
      const data = await jobOps.getFilterOptions()
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
   * Get companies options
   */
  const companiesOptions = computed<FilterOption[]>(() => {
    return options.value?.companies || []
  })
  
  /**
   * Get locations options
   */
  const locationsOptions = computed<FilterOption[]>(() => {
    return options.value?.locations || []
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
    companiesOptions,
    locationsOptions,
    // Actions
    fetchOptions,
    reset,
  }
}

export const useJobFilterOptions = createSharedComposable(_useJobFilterOptions)

