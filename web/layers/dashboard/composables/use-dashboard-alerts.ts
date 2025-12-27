/**
 * Use Dashboard Alerts Composable
 * Shared composable for managing dashboard alerts state
 * Uses Layer 2: createSharedComposable for module-scoped state
 */
import { createSharedComposable } from '@vueuse/core'
import type { DashboardAlert, DashboardAlertSeverity, DashboardAlertsApiItem } from '@dashboard/types/dashboard'
import { useDashboardApi } from '@dashboard/utils/dashboard-api'

const normalizeSeverity = (severity: unknown): DashboardAlertSeverity => {
  if (severity === 'info' || severity === 'warning' || severity === 'critical') return severity
  // Back-compat if server sends "error"
  if (severity === 'error') return 'critical'
  return 'info'
}

const severityRank: Record<DashboardAlertSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
}

const normalizeAlert = (raw: DashboardAlertsApiItem, idx: number): DashboardAlert => {
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id : `alert-${idx}`
  const type = typeof raw.type === 'string' && raw.type.trim() ? raw.type : 'unknown'
  const message = typeof raw.message === 'string' && raw.message.trim() ? raw.message : 'Action required'
  const actionUrl = typeof raw.actionUrl === 'string' && raw.actionUrl.trim() ? raw.actionUrl : '/'
  const severity = normalizeSeverity(raw.severity)

  return { id, type, message, actionUrl, severity }
}

const _useDashboardAlerts = () => {
  const alerts = reactive<DashboardAlert[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const dashboardApi = useDashboardApi()
  
  /**
   * Normalize alerts data
   */
  const normalizeAlerts = (rawAlerts: DashboardAlertsApiItem[]): DashboardAlert[] => {
    return rawAlerts
      .map((a, idx) => normalizeAlert(a, idx))
      .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
  }
  
  /**
   * Fetch dashboard alerts
   */
  const fetchAlerts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await dashboardApi.getAlerts()
      const normalized = normalizeAlerts(response.alerts ?? [])
      alerts.splice(0, alerts.length, ...normalized)
      return normalized
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch dashboard alerts'
      error.value = errorMessage
      throw e
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Refresh alerts
   */
  const refresh = async () => {
    return await fetchAlerts()
  }
  
  /**
   * Reset all state
   */
  const reset = () => {
    alerts.splice(0, alerts.length)
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
    alerts,
    loading,
    error,
    // Actions
    fetchAlerts,
    refresh,
    reset,
  }
}

export const useDashboardAlerts = createSharedComposable(_useDashboardAlerts)
