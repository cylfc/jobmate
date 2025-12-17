export type KpiTrend = 'up' | 'down' | 'flat'

export interface KpiCard {
  id: string
  label: string
  value: string | number
  delta?: number
  icon?: string
  loading?: boolean
}

export type JobStatus = 'published' | 'draft' | 'closed'

export interface ActiveJobRow {
  id: string
  title: string
  company: string
  location?: string
  status: JobStatus
  applicants: number
  matched: number
  updatedAt: string
}

export type TaskSeverity = 'info' | 'warning' | 'error' | 'success'

export interface TaskItem {
  id: string
  title: string
  description?: string
  severity: TaskSeverity
  due?: string
  ctaLabel?: string
}

export interface MatchingHealthMetric {
  id: string
  label: string
  value: number
  hint?: string
}

export interface PipelineStage {
  id: string
  label: string
  count: number
  color?: 'neutral' | 'primary' | 'success' | 'info' | 'warning' | 'error'
}

export interface ActivityItem {
  id: string
  title: string
  description?: string
  at: string
  icon?: string
}


