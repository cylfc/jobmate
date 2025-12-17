import type { MatchScoreDistributionBin, MatchingHealthAggregates } from '@dashboard/types/dashboard'

export interface MatchingHealthApiResponse {
  scoreDistribution: MatchScoreDistributionBin[]
  highQualityRatio: number
  lowQualityRatio: number
}

const MATCHING_HEALTH_ASYNC_KEY = 'dashboard:matching-health'

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

export function useMatchingHealth() {
  const { data, pending, error, refresh } = useAsyncData<MatchingHealthApiResponse>(
    MATCHING_HEALTH_ASYNC_KEY,
    () => $fetch('/api/dashboard/matching-health'),
    { dedupe: 'defer' }
  )

  const scoreDistribution = computed<MatchScoreDistributionBin[]>(() => safeBins(data.value?.scoreDistribution))
  const highQualityRatio = computed<number>(() => safeRatio(data.value?.highQualityRatio))
  const lowQualityRatio = computed<number>(() => safeRatio(data.value?.lowQualityRatio))

  const aggregates = computed<MatchingHealthAggregates>(() => ({
    scoreDistribution: scoreDistribution.value,
    highQualityRatio: highQualityRatio.value,
    lowQualityRatio: lowQualityRatio.value,
  }))

  return {
    data,
    pending,
    error,
    refresh,
    scoreDistribution,
    highQualityRatio,
    lowQualityRatio,
    aggregates,
  }
}


