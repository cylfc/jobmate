/**
 * Shared Filter Types
 * Common filter types used across multiple layers
 */

/**
 * Generic filter option for dropdowns
 */
export interface FilterOption {
  label: string
  value: string | number
}

/**
 * Generic filter interface
 */
export interface BaseFilter {
  search?: string
  page?: number
  limit?: number
}
