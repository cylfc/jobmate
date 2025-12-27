/**
 * Use Job List Composable
 * Shared composable for managing job list state within the job module
 * Uses Layer 2: createSharedComposable for module-scoped state
 */
import { createSharedComposable } from '@vueuse/core'
import type { Job, JobFilter } from '@job/types/job'
import { useJob } from '@job/utils/job-api'

const _useJobList = () => {
  const jobs = reactive<Job[]>([])
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
      jobs.splice(0, jobs.length, ...data)
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
    jobs.splice(0, jobs.length)
    loading.value = false
    error.value = null
  }
  
  /**
   * Add a job to the list (optimistic update)
   */
  const addJob = (job: Job) => {
    jobs.unshift(job)
  }
  
  /**
   * Update a job in the list
   */
  const updateJobInList = (updatedJob: Job) => {
    const index = jobs.findIndex(j => j.id === updatedJob.id)
    if (index !== -1) {
      jobs[index] = updatedJob
    }
  }
  
  /**
   * Remove a job from the list
   */
  const removeJob = (jobId: string) => {
    const index = jobs.findIndex(j => j.id === jobId)
    if (index !== -1) {
      jobs.splice(index, 1)
    }
  }
  
  /**
   * Remove multiple jobs from the list
   */
  const removeJobs = (jobIds: string[]) => {
    jobIds.forEach(id => {
      const index = jobs.findIndex(j => j.id === id)
      if (index !== -1) {
        jobs.splice(index, 1)
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
    jobs,
    loading,
    error,
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

