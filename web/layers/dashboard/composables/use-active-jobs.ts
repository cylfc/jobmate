/**
 * Use Active Jobs Composable
 * Shared composable for managing active jobs state
 * Uses Layer 2: createSharedComposable for module-scoped state
 */
import { createSharedComposable } from '@vueuse/core'
import type { ActiveJob, ActiveJobsApiItem } from '@dashboard/types/dashboard'
import { useDashboardApi } from '@dashboard/utils/dashboard-api'

const toEpoch = (iso: string | null | undefined) => {
  if (!iso) return 0
  const ms = Date.parse(iso)
  return Number.isFinite(ms) ? ms : 0
}

export function hasRunMatching(job: Pick<ActiveJob, 'lastMatchingRunAt' | 'topMatchScore'>) {
  // Prefer explicit signal, fallback to any computed score.
  return Boolean(job.lastMatchingRunAt) || job.topMatchScore !== null
}

export function needsAttention(job: Pick<ActiveJob, 'status' | 'lastMatchingRunAt' | 'topMatchScore'>) {
  // Keep it deliberately minimal and deterministic: attention needed when a published job has never run matching.
  return job.status === 'published' && !hasRunMatching(job)
}

const _useActiveJobs = () => {
  const jobs = reactive<ActiveJob[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const dashboardApi = useDashboardApi()
  
  /**
   * Normalize active jobs data
   */
  const normalizeJobs = (rawJobs: ActiveJobsApiItem[]): ActiveJob[] => {
    return rawJobs
      .map((j) => ({
        id: String(j.id),
        title: String(j.title ?? ''),
        status: j.status,
        candidatesCount: Number.isFinite(Number(j.candidatesCount)) ? Number(j.candidatesCount) : 0,
        topMatchScore:
          j.topMatchScore === null || j.topMatchScore === undefined
            ? null
            : Number.isFinite(Number(j.topMatchScore))
              ? Number(j.topMatchScore)
              : null,
        lastActivityAt: String(j.lastActivityAt ?? ''),
        lastMatchingRunAt: j.lastMatchingRunAt ?? null,
      }))
      .sort((a, b) => toEpoch(b.lastActivityAt) - toEpoch(a.lastActivityAt))
  }
  
  /**
   * Fetch active jobs
   */
  const fetchActiveJobs = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await dashboardApi.getActiveJobs()
      const normalized = normalizeJobs(response.jobs ?? [])
      jobs.splice(0, jobs.length, ...normalized)
      return normalized
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch active jobs'
      error.value = errorMessage
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Refresh active jobs
   */
  const refresh = async () => {
    return await fetchActiveJobs()
  }
  
  /**
   * Reset all state
   */
  const reset = () => {
    jobs.splice(0, jobs.length)
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
    jobs,
    loading,
    error,
    // Actions
    fetchActiveJobs,
    refresh,
    reset,
    // Utility functions
    hasRunMatching,
    needsAttention,
  }
}

export const useActiveJobs = createSharedComposable(_useActiveJobs)
