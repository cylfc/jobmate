import type { DashboardAlert, DashboardAlertSeverity } from '@dashboard/types/dashboard'

export interface DashboardAlertsApiItem {
  id?: string
  type?: string
  message?: string
  actionUrl?: string
  severity?: string
  // Allow arbitrary extra fields without breaking normalization.
  [key: string]: unknown
}

export interface DashboardAlertsApiResponse {
  alerts: DashboardAlertsApiItem[]
}

const DASHBOARD_ALERTS_ASYNC_KEY = 'dashboard:alerts'

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

export function useDashboardAlerts() {
  const { data, pending, error, refresh } = useAsyncData<DashboardAlertsApiResponse>(
    DASHBOARD_ALERTS_ASYNC_KEY,
    () => $fetch('/api/dashboard/alerts'),
    { dedupe: 'defer' }
  )

  const alerts = computed<DashboardAlert[]>(() => {
    const raw = data.value?.alerts ?? []
    return raw
      .map((a, idx) => normalizeAlert(a, idx))
      .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
  })

  return {
    data,
    pending,
    error,
    refresh,
    alerts,
  }
}


