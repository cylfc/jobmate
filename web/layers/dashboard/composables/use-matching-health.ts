/**
 * Use Matching Health Composable
 * Shared composable for managing matching health state
 * Uses Layer 2: createSharedComposable for module-scoped state
 */
import { createSharedComposable } from '@vueuse/core'
import type {
  MatchScoreDistributionBin,
  MatchingHealthAggregates,
} from '@dashboard/types/dashboard'
import { useDashboardApi } from '@dashboard/utils/dashboard-api'

const safeRatio = (value: unknown) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

const safeBins = (value: unknown): MatchScoreDistributionBin[] => {
  if (!Array.isArray(value)) return []
  return value.map((b) => {
    const raw = b as Partial<MatchScoreDistributionBin> & Record<string, unknown>
    return {
      label: typeof raw.label === 'string' ? raw.label : '',
      ratio: safeRatio(raw.ratio),
      count: Number.isFinite(Number(raw.count)) ? Number(raw.count) : undefined,
    }
  })
}

const _useMatchingHealth = () => {
  const scoreDistribution = reactive<MatchScoreDistributionBin[]>([])
  const highQualityRatio = ref<number>(0)
  const lowQualityRatio = ref<number>(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const dashboardApi = useDashboardApi()
  
  /**
   * Fetch matching health data
   */
  const fetchMatchingHealth = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await dashboardApi.getMatchingHealth()
      const bins = safeBins(data.scoreDistribution)
      scoreDistribution.splice(0, scoreDistribution.length, ...bins)
      highQualityRatio.value = safeRatio(data.highQualityRatio)
      lowQualityRatio.value = safeRatio(data.lowQualityRatio)
      return getAggregates()
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch matching health'
      error.value = errorMessage
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Get aggregates
   */
  const getAggregates = (): MatchingHealthAggregates => ({
    scoreDistribution: [...scoreDistribution],
    highQualityRatio: highQualityRatio.value,
    lowQualityRatio: lowQualityRatio.value,
  })
  
  /**
   * Refresh matching health
   */
  const refresh = async () => {
    return await fetchMatchingHealth()
  }
  
  /**
   * Reset all state
   */
  const reset = () => {
    scoreDistribution.splice(0, scoreDistribution.length)
    highQualityRatio.value = 0
    lowQualityRatio.value = 0
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
    scoreDistribution,
    highQualityRatio,
    lowQualityRatio,
    loading,
    error,
    // Computed aggregates
    aggregates: computed(() => getAggregates()),
    // Actions
    fetchMatchingHealth,
    refresh,
    reset,
  }
}

export const useMatchingHealth = createSharedComposable(_useMatchingHealth)
