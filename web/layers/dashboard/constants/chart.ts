/**
 * Chart-related constants
 */

// Chart axis types
export const CHART_AXIS_TYPE = {
  CATEGORY: 'category',
  VALUE: 'value',
} as const

export type ChartAxisType = typeof CHART_AXIS_TYPE[keyof typeof CHART_AXIS_TYPE]

// Chart series types
export const CHART_SERIES_TYPE = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
} as const

export type ChartSeriesType = typeof CHART_SERIES_TYPE[keyof typeof CHART_SERIES_TYPE]

// Tooltip triggers
export const TOOLTIP_TRIGGER = {
  AXIS: 'axis',
  ITEM: 'item',
} as const

export type TooltipTrigger = typeof TOOLTIP_TRIGGER[keyof typeof TOOLTIP_TRIGGER]

// Axis pointer types
export const AXIS_POINTER_TYPE = {
  SHADOW: 'shadow',
} as const

export type AxisPointerType = typeof AXIS_POINTER_TYPE[keyof typeof AXIS_POINTER_TYPE]

// Symbol types
export const SYMBOL_TYPE = {
  CIRCLE: 'circle',
  NONE: 'none',
} as const

export type SymbolType = typeof SYMBOL_TYPE[keyof typeof SYMBOL_TYPE]

// Legend orientations
export const LEGEND_ORIENT = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
} as const

export type LegendOrient = typeof LEGEND_ORIENT[keyof typeof LEGEND_ORIENT]

// Legend positions
export const LEGEND_POSITION = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center',
  TOP: 'top',
  BOTTOM: 'bottom',
  MIDDLE: 'middle',
} as const

export type LegendPosition = typeof LEGEND_POSITION[keyof typeof LEGEND_POSITION]

// Chart colors
export const CHART_COLORS = {
  BRAND_500: '#c6613f',
  BRAND_600: '#a84d2f',
  GRAY_500: '#6b7280',
  EMERALD_500: '#10b981',
  ROSE_500: '#f43f5e',
  AMBER_500: '#f59e0b',
  SKY_500: '#0ea5e9',
  PURPLE_500: '#a855f7',
  INDIGO_500: '#6366f1',
  WHITE: '#fff',
  TRANSPARENT: 'transparent',
  SPLIT_LINE: 'rgba(148,163,184,0.25)',
} as const

// Chart default dimensions
export const CHART_DIMENSIONS = {
  DEFAULT_HEIGHT: '300px',
  SPARKLINE_HEIGHT: '40px',
  SPARKLINE_KPI_HEIGHT: '64px',
  DEFAULT_WIDTH: '100%',
  BAR_MAX_WIDTH: 32,
  SYMBOL_SIZE: 6,
  LINE_WIDTH: 2,
} as const

// Chart grid/spacing
export const CHART_GRID = {
  LEFT_SMALL: 12,
  LEFT_LARGE: 80,
  RIGHT: 12,
  TOP: 10,
  BOTTOM: 24,
  SPARKLINE_TOP: 2,
  SPARKLINE_BOTTOM: 2,
} as const

// Chart typography
export const CHART_TYPOGRAPHY = {
  FONT_SIZE_SMALL: 11,
  FONT_SIZE_MEDIUM: 12,
} as const

// Chart border radius
export const CHART_BORDER_RADIUS = {
  BAR_HORIZONTAL: [0, 6, 6, 0],
  BAR_VERTICAL: [6, 6, 0, 0],
  PIE: 4,
  PIE_BORDER_WIDTH: 2,
} as const

// Chart calculation factors
export const CHART_CALCULATION = {
  MAX_VALUE_MULTIPLIER: 1.1,
  SPARKLINE_RANGE_MULTIPLIER: 0.1,
  AREA_OPACITY: 0.15,
} as const

// Chart pie/donut radius
export const CHART_RADIUS = {
  DONUT_INNER: '40%',
  DONUT_OUTER: '70%',
  PIE_START: '0%',
  CENTER: '50%',
} as const

// Chart gradient
export const CHART_GRADIENT = {
  LINEAR_X: 0,
  LINEAR_Y: 0,
  LINEAR_X2: 0,
  LINEAR_Y2: 1,
  COLOR_STOP_START: 0,
  COLOR_STOP_END: 1,
} as const

// Default chart color palette
export const DEFAULT_CHART_COLORS = [
  CHART_COLORS.BRAND_500,
  'var(--color-sky-500)',
  'var(--color-emerald-500)',
  'var(--color-amber-500)',
  'var(--color-rose-500)',
] as const

// Extended color palette for pie charts
export const PIE_CHART_COLORS = [
  ...DEFAULT_CHART_COLORS,
  'var(--color-purple-500)',
  'var(--color-indigo-500)',
] as const

// CSS variable to color mapping
export const CSS_VAR_COLOR_MAP: Record<string, string> = {
  'var(--color-brand-600)': CHART_COLORS.BRAND_600,
  'var(--color-brand-500)': CHART_COLORS.BRAND_500,
  'var(--color-emerald-500)': CHART_COLORS.EMERALD_500,
  'var(--color-rose-500)': CHART_COLORS.ROSE_500,
} as const

