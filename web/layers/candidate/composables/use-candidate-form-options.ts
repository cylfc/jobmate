import { ref, computed, readonly, onMounted } from 'vue'
import type { ApiResponse } from '../../../../types/api-response'

/**
 * Composable for fetching candidate form dropdown options
 * Uses shared state to avoid multiple API calls
 */
// Shared state (singleton pattern)
const sharedState = {
  formOptions: ref<{
    degreeTypes: Array<{ label: string; value: string }>
    skillTypes: Array<{ label: string; value: string }>
    skillLevels: Array<{ label: string; value: string }>
    employmentTypes: Array<{ label: string; value: string }>
  }>({
    degreeTypes: [],
    skillTypes: [],
    skillLevels: [],
    employmentTypes: [],
  }),
  isLoading: ref(false),
  error: ref<Error | null>(null),
  isFetched: ref(false),
  fetchPromise: null as Promise<void> | null,
}

export const useCandidateFormOptions = () => {
  const { $api } = useNuxtApp()

  const fetchOptions = async () => {
    // If already fetching, return the existing promise
    if (sharedState.fetchPromise) {
      return sharedState.fetchPromise
    }

    // If already fetched, skip
    if (sharedState.isFetched.value && !sharedState.error.value) {
      return
    }

    sharedState.isLoading.value = true
    sharedState.error.value = null

    sharedState.fetchPromise = (async () => {
      try {
        // Call API with ApiResponse type - returns { data, meta, status }
        const response = await $api<ApiResponse<{
          degreeTypes: Array<{ label: string; value: string }>
          skillTypes: Array<{ label: string; value: string }>
          skillLevels: Array<{ label: string; value: string }>
          employmentTypes: Array<{ label: string; value: string }>
        }>>('/api/candidates/form-options', {
          method: 'GET',
        })
        // Access data from response.data
        sharedState.formOptions.value = response.data || {
          degreeTypes: [],
          skillTypes: [],
          skillLevels: [],
          employmentTypes: [],
        }
        sharedState.isFetched.value = true
      } catch (err) {
        sharedState.error.value = err instanceof Error ? err : new Error('Failed to fetch form options')
        console.error('Error fetching form options:', err)
      } finally {
        sharedState.isLoading.value = false
        sharedState.fetchPromise = null
      }
    })()

    return sharedState.fetchPromise
  }

  // Fetch on mount (only if not already fetched)
  onMounted(() => {
    if (!sharedState.isFetched.value && !sharedState.isLoading.value) {
      fetchOptions()
    }
  })

  return {
    formOptions: computed(() => ({
      degreeTypes: [...sharedState.formOptions.value.degreeTypes],
      skillTypes: [...sharedState.formOptions.value.skillTypes],
      skillLevels: [...sharedState.formOptions.value.skillLevels],
      employmentTypes: [...sharedState.formOptions.value.employmentTypes],
    })),
    isLoading: readonly(sharedState.isLoading),
    error: readonly(sharedState.error),
    refresh: fetchOptions,
  }
}

