/**
 * Use Recent Activities Composable
 * Shared composable for managing recent activities state
 * Uses Layer 2: createSharedComposable for module-scoped state
 * Supports pagination with query params (Layer 3)
 */
import { createSharedComposable } from '@vueuse/core'
import type { RecentActivityEvent, RecentActivityType } from '@dashboard/types/dashboard'
import { useDashboardApi, type UseRecentActivitiesOptions } from '@dashboard/utils/dashboard-api'

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

const _useRecentActivities = () => {
  const events = reactive<RecentActivityEvent[]>([])
  const nextCursor = ref<string | null>(null)
  const hasMore = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const dashboardApi = useDashboardApi()
  
  /**
   * Fetch recent activities
   */
  const fetchRecentActivities = async (options: UseRecentActivitiesOptions = {}) => {
    loading.value = true
    error.value = null
    try {
      const limit = Number.isFinite(Number(options.limit))
        ? Math.max(1, Math.trunc(Number(options.limit)))
        : 20
      const cursor = options.cursor ?? null
      
      const response = await dashboardApi.getRecentActivities({ limit, cursor })
      
      const raw = response.events ?? []
      const normalized = raw.map((e, idx) => normalizeEvent(e as any, idx))
      // Stable ordering: newest first.
      const sorted = normalized.sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)).slice(0, limit)
      events.splice(0, events.length, ...sorted)
      nextCursor.value = response.nextCursor ?? null
      hasMore.value = Boolean(response.hasMore)
      
      return {
        events: [...events],
        nextCursor: nextCursor.value,
        hasMore: hasMore.value,
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch recent activities'
      error.value = errorMessage
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Refresh recent activities
   */
  const refresh = async (options: UseRecentActivitiesOptions = {}) => {
    return await fetchRecentActivities(options)
  }
  
  /**
   * Load more activities (pagination)
   */
  const loadMore = async (limit: number = 20) => {
    if (!hasMore.value || !nextCursor.value) return
    
    loading.value = true
    error.value = null
    try {
      const response = await dashboardApi.getRecentActivities({ limit, cursor: nextCursor.value })
      
      const raw = response.events ?? []
      const normalized = raw.map((e, idx) => normalizeEvent(e as any, idx))
      // Append new events
      const allEvents = [...events, ...normalized].sort(
        (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)
      )
      events.splice(0, events.length, ...allEvents)
      nextCursor.value = response.nextCursor ?? null
      hasMore.value = Boolean(response.hasMore)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load more activities'
      error.value = errorMessage
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Reset all state
   */
  const reset = () => {
    events.splice(0, events.length)
    nextCursor.value = null
    hasMore.value = false
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
    events,
    nextCursor,
    hasMore,
    loading,
    error,
    // Actions
    fetchRecentActivities,
    refresh,
    loadMore,
    reset,
  }
}

export const useRecentActivities = createSharedComposable(_useRecentActivities)
