/**
 * Use Candidate Pipeline Composable
 * Shared composable for managing candidate pipeline state
 * Uses Layer 2: createSharedComposable for module-scoped state
 */
import { createSharedComposable } from '@vueuse/core'
import type {
  CandidatePipelineStage,
  CandidatePipelineStageId,
  CandidatePipelineApiItem,
} from '@dashboard/types/dashboard'
import { useDashboardApi } from '@dashboard/utils/dashboard-api'

const DEFAULT_STAGE_ORDER: CandidatePipelineStageId[] = [
  'uploaded',
  'matched',
  'contacted',
  'interviewing',
  'offer',
]

const safeCount = (value: unknown) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.trunc(n))
}

const normalizeStages = (rawStages: unknown): CandidatePipelineStage[] => {
  const items = Array.isArray(rawStages) ? (rawStages as CandidatePipelineApiItem[]) : []

  const map = new Map<CandidatePipelineStageId, number>()
  for (const it of items) {
    const id = (it?.id ?? '') as CandidatePipelineStageId
    if (!id) continue
    map.set(id, safeCount(it?.count))
  }

  const normalized: CandidatePipelineStage[] = DEFAULT_STAGE_ORDER.map((id) => ({
    id,
    count: map.get(id) ?? 0,
  }))

  // Support future stage extension: append unknown stages from server in stable order.
  for (const [id, count] of map.entries()) {
    if (!DEFAULT_STAGE_ORDER.includes(id)) normalized.push({ id, count })
  }

  return normalized
}

const _useCandidatePipeline = () => {
  const stages = reactive<CandidatePipelineStage[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const dashboardApi = useDashboardApi()
  
  /**
   * Fetch candidate pipeline data
   */
  const fetchCandidatePipeline = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await dashboardApi.getCandidatePipeline()
      const normalized = normalizeStages(response.stages)
      stages.splice(0, stages.length, ...normalized)
      return normalized
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch candidate pipeline'
      error.value = errorMessage
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Refresh candidate pipeline
   */
  const refresh = async () => {
    return await fetchCandidatePipeline()
  }
  
  /**
   * Reset all state
   */
  const reset = () => {
    stages.splice(0, stages.length)
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
    stages,
    loading,
    error,
    // Actions
    fetchCandidatePipeline,
    refresh,
    reset,
  }
}

export const useCandidatePipeline = createSharedComposable(_useCandidatePipeline)
