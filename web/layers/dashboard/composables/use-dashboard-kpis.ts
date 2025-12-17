export interface DashboardKpisResponse {
  openJobs: number
  candidatesInPipeline: number
  matchesThisWeek: number
  averageMatchScore: number
  timeToShortlist: number
}

export interface DashboardKpisNormalized {
  openJobs: number
  candidatesInPipeline: number
  matchesThisWeek: number
  averageMatchScore: number
  timeToShortlist: number
}

const DASHBOARD_KPIS_ASYNC_KEY = 'dashboard:kpis'

export function useDashboardKpis() {
  const { data, pending, error, refresh } = useAsyncData<DashboardKpisResponse>(
    DASHBOARD_KPIS_ASYNC_KEY,
    () => $fetch('/api/dashboard/kpis'),
    {
      // prepare for caching later
      dedupe: 'defer',
    }
  )

  const normalized = computed<DashboardKpisNormalized>(() => {
    const safe = (value: unknown) => (Number.isFinite(Number(value)) ? Number(value) : 0)

    return {
      openJobs: safe(data.value?.openJobs),
      candidatesInPipeline: safe(data.value?.candidatesInPipeline),
      matchesThisWeek: safe(data.value?.matchesThisWeek),
      averageMatchScore: safe(data.value?.averageMatchScore),
      timeToShortlist: safe(data.value?.timeToShortlist),
    }
  })

  return {
    data,
    pending,
    error,
    refresh,
    normalized,
  }
}


