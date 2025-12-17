import type { RecentActivitiesResponse, RecentActivityEvent, RecentActivityType } from '@dashboard/types/dashboard'

export interface UseRecentActivitiesOptions {
  /**
   * Keep pagination-ready. When cursor is supported server-side, pass it here.
   */
  cursor?: string | null
  /**
   * Max events to request. Server should enforce; this is a hint.
   */
  limit?: number
}

const RECENT_ACTIVITIES_ASYNC_KEY = 'dashboard:recent-activities'

const isIso = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value))

const safeType = (value: unknown): RecentActivityType =>
  typeof value === 'string' && value.trim() ? (value as RecentActivityType) : 'unknown'

const normalizeEvent = (raw: Partial<RecentActivityEvent> & Record<string, unknown>, idx: number): RecentActivityEvent => {
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id : `activity-${idx}`
  const type = safeType(raw.type)
  const occurredAt = isIso(raw.occurredAt) ? String(raw.occurredAt) : new Date().toISOString()
  const meta = typeof raw.meta === 'object' && raw.meta !== null ? (raw.meta as Record<string, unknown>) : undefined

  return { id, type, occurredAt, meta }
}

export function useRecentActivities(options: UseRecentActivitiesOptions = {}) {
  const limit = Number.isFinite(Number(options.limit)) ? Math.max(1, Math.trunc(Number(options.limit))) : 20
  const cursor = options.cursor ?? null

  const { data, pending, error, refresh } = useAsyncData<RecentActivitiesResponse>(
    `${RECENT_ACTIVITIES_ASYNC_KEY}:${cursor ?? 'first'}:${limit}`,
    () =>
      $fetch('/api/dashboard/activities', {
        query: {
          limit,
          cursor: cursor ?? undefined,
        },
      }),
    { dedupe: 'defer' }
  )

  const events = computed<RecentActivityEvent[]>(() => {
    const raw = data.value?.events ?? []
    const normalized = raw.map((e, idx) => normalizeEvent(e as any, idx))
    // Stable ordering: newest first.
    return normalized.sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)).slice(0, 20)
  })

  return {
    data,
    pending,
    error,
    refresh,
    events,
    nextCursor: computed(() => data.value?.nextCursor ?? null),
    hasMore: computed(() => Boolean(data.value?.hasMore)),
  }
}


