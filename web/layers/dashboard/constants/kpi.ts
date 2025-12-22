/**
 * KPI-related constants
 */

// KPI badge colors
export const KPI_BADGE_COLOR = {
  NEUTRAL: 'neutral',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
} as const

export type KpiBadgeColor = typeof KPI_BADGE_COLOR[keyof typeof KPI_BADGE_COLOR]

// KPI icon names
export const KPI_ICON = {
  MINUS: 'i-lucide-minus',
  TRENDING_UP: 'i-lucide-trending-up',
  TRENDING_DOWN: 'i-lucide-trending-down',
} as const

export type KpiIcon = typeof KPI_ICON[keyof typeof KPI_ICON]

// KPI color codes
export const KPI_COLORS = {
  EMERALD_500: '#10b981',
  ROSE_500: '#f43f5e',
} as const

// KPI text color classes
export const KPI_TEXT_COLOR = {
  MUTED: 'text-muted',
  EMERALD_600: 'text-emerald-600',
  ROSE_600: 'text-rose-600',
  AMBER_600: 'text-amber-600',
} as const

export type KpiTextColor = typeof KPI_TEXT_COLOR[keyof typeof KPI_TEXT_COLOR]

// KPI labels
export const KPI_LABELS = {
  LAST_7_DAYS: 'Last 7 days',
  DAY_PREFIX: 'Day',
} as const

// KPI progress
export const KPI_PROGRESS = {
  MAX: 100,
} as const

// KPI chart dimensions
export const KPI_CHART_DIMENSIONS = {
  HEIGHT: '64px',
  WIDTH: '100%',
} as const

