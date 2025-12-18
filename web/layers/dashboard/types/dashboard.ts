export type KpiTrend = 'up' | 'down' | 'flat'

export interface KpiCard {
  id: string
  label: string
  value: string | number
  delta?: number
  icon?: string
  loading?: boolean
  /**
   * Trend data array (e.g., last 7 days values) for sparkline chart
   */
  trendData?: number[]
}

export type JobStatus = 'published' | 'draft' | 'closed'

export interface ActiveJobRow {
  id: string
  title: string
  status: JobStatus
  candidatesCount: number
  topMatchScore: number | null
  lastActivityAt: string // ISO string
  lastMatchingRunAt: string | null // ISO string
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

export type DashboardAlertSeverity = 'info' | 'warning' | 'critical'

export interface DashboardAlert {
  id: string
  type: string
  message: string
  actionUrl: string
  severity: DashboardAlertSeverity
}

export interface MatchingHealthMetric {
  id: string
  label: string
  value: number
  hint?: string
}

export interface MatchScoreDistributionBin {
  /**
   * Label to display, e.g. "0–20", "20–40", "80–100"
   */
  label: string
  /**
   * Share of matches that fall in this bin, expressed as 0..1.
   * NOTE: Provided by backend aggregation; do not compute on frontend.
   */
  ratio: number
  /**
   * Optional absolute count (also backend-provided).
   */
  count?: number
}

export interface MatchingHealthAggregates {
  scoreDistribution: MatchScoreDistributionBin[]
  /**
   * Share of high-quality matches (score > 80), 0..1.
   */
  highQualityRatio: number
  /**
   * Share of low-quality matches (score < 60), 0..1.
   */
  lowQualityRatio: number
}

export interface PipelineStage {
  id: string
  label: string
  count: number
  color?: 'neutral' | 'primary' | 'success' | 'info' | 'warning' | 'error'
}

export type CandidatePipelineStageId = 'uploaded' | 'matched' | 'contacted' | 'interviewing' | 'offer' | (string & {})

export interface CandidatePipelineStage {
  id: CandidatePipelineStageId
  count: number
}

export interface ActivityItem {
  id: string
  title: string
  description?: string
  at: string
  icon?: string
}

export type RecentActivityType =
  | 'cv_uploaded'
  | 'job_saved'
  | 'matching_completed'
  | 'interview_scheduled'
  | (string & {})

export interface RecentActivityEvent {
  id: string
  type: RecentActivityType
  /**
   * ISO string for stable grouping/sorting.
   */
  occurredAt: string
  /**
   * Optional metadata provided by backend (e.g. candidateName, jobTitle).
   * Keep untyped for forward compatibility; UI can choose what to show.
   */
  meta?: Record<string, unknown>
}

export interface RecentActivitiesResponse {
  events: RecentActivityEvent[]
  /**
   * Pagination-ready fields (optional for now).
   */
  nextCursor?: string | null
  hasMore?: boolean
}


