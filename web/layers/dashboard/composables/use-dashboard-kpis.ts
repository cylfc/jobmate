/**
 * Use Dashboard KPIs Composable
 * Shared composable for managing dashboard KPIs state
 * Uses Layer 2: createSharedComposable for module-scoped state
 */
import { createSharedComposable } from '@vueuse/core'
import type { DashboardKpisResponse, DashboardKpisNormalized } from '@dashboard/types/dashboard'
import { useDashboardApi } from '@dashboard/utils/dashboard-api'

const _useDashboardKpis = () => {
  const kpis = ref<DashboardKpisNormalized | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const dashboardApi = useDashboardApi()
  
  /**
   * Normalize KPIs data
   */
  const normalizeKpis = (data: DashboardKpisResponse | null): DashboardKpisNormalized => {
    const safe = (value: unknown) => (Number.isFinite(Number(value)) ? Number(value) : 0)
    
    if (!data) {
      return {
        openJobs: 0,
        candidatesInPipeline: 0,
        matchesThisWeek: 0,
        averageMatchScore: 0,
        timeToShortlist: 0,
      }
    }
    
    return {
      openJobs: safe(data.openJobs),
      candidatesInPipeline: safe(data.candidatesInPipeline),
      matchesThisWeek: safe(data.matchesThisWeek),
      averageMatchScore: safe(data.averageMatchScore),
      timeToShortlist: safe(data.timeToShortlist),
    }
  }
  
  /**
   * Fetch dashboard KPIs
   */
  const fetchKpis = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await dashboardApi.getKpis()
      kpis.value = normalizeKpis(data)
      return kpis.value
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch dashboard KPIs'
      error.value = errorMessage
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Refresh KPIs
   */
  const refresh = async () => {
    return await fetchKpis()
  }
  
  /**
   * Reset all state
   */
  const reset = () => {
    kpis.value = null
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
    kpis,
    loading,
    error,
    // Computed normalized values (for backward compatibility)
    normalized: computed(() => kpis.value || normalizeKpis(null)),
    // Actions
    fetchKpis,
    refresh,
    reset,
  }
}

export const useDashboardKpis = createSharedComposable(_useDashboardKpis)
