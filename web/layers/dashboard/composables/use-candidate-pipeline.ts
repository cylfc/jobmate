import type { CandidatePipelineStage, CandidatePipelineStageId } from '@dashboard/types/dashboard'

export interface CandidatePipelineApiItem {
  id: CandidatePipelineStageId
  count: number
  // Allow future extensions without breaking normalization
  [key: string]: unknown
}

export interface CandidatePipelineApiResponse {
  stages: CandidatePipelineApiItem[]
}

const CANDIDATE_PIPELINE_ASYNC_KEY = 'dashboard:candidate-pipeline'

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

export function useCandidatePipeline() {
  const { data, pending, error, refresh } = useAsyncData<CandidatePipelineApiResponse>(
    CANDIDATE_PIPELINE_ASYNC_KEY,
    () => $fetch('/api/dashboard/pipeline'),
    { dedupe: 'defer' }
  )

  const stages = computed<CandidatePipelineStage[]>(() => normalizeStages(data.value?.stages))

  return {
    data,
    pending,
    error,
    refresh,
    stages,
  }
}


