/**
 * Use Job List Composable
 * Shared composable for managing job list state within the job module
 * Uses Layer 2: createSharedComposable for module-scoped state
 */
import { createSharedComposable } from '@vueuse/core'
import type { Job, JobFilter } from '@job/types/job'
import { useJob } from '@job/utils/job-api'

const _useJobList = () => {
  const jobs = ref<Job[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const jobOps = useJob()
  
  /**
   * Fetch jobs with optional filters
   */
  const fetchJobs = async (filters?: JobFilter) => {
    loading.value = true
    error.value = null
    try {
      const data = await jobOps.getJobs(filters)
      jobs.value = data
      return data
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch jobs'
      error.value = errorMessage
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Refresh jobs with current filters
   * Note: This will use empty filters. For filtered refresh, use fetchJobs with filters.
   */
  const refresh = async (filters?: JobFilter) => {
    return await fetchJobs(filters)
  }
  
  /**
   * Reset all state
   */
  const reset = () => {
    jobs.value = []
    loading.value = false
    error.value = null
  }
  
  /**
   * Add a job to the list (optimistic update)
   */
  const addJob = (job: Job) => {
    jobs.value = [job, ...jobs.value]
  }
  
  /**
   * Update a job in the list
   */
  const updateJobInList = (updatedJob: Job) => {
    const index = jobs.value.findIndex(j => j.id === updatedJob.id)
    if (index !== -1) {
      jobs.value[index] = updatedJob
    }
  }
  
  /**
   * Remove a job from the list
   */
  const removeJob = (jobId: string) => {
    jobs.value = jobs.value.filter(j => j.id !== jobId)
  }
  
  /**
   * Remove multiple jobs from the list
   */
  const removeJobs = (jobIds: string[]) => {
    jobs.value = jobs.value.filter(j => !jobIds.includes(j.id))
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
    // Readonly state - prevent external mutation
    jobs: readonly(jobs),
    loading: readonly(loading),
    error: readonly(error),
    // Actions
    fetchJobs,
    refresh,
    reset,
    addJob,
    updateJobInList,
    removeJob,
    removeJobs,
  }
}

export const useJobList = createSharedComposable(_useJobList)

