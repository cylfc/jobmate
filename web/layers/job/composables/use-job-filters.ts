/**
 * Use Job Filters Composable
 * Manages job filters with URL query parameter synchronization
 * Uses Layer 3: Query Parameters for shareable state
 */
import type { JobFilter, JobStatus } from '@job/types/job'

export const useJobFilters = () => {
  const route = useRoute()
  const router = useRouter()
  
  /**
   * Computed filters synced with URL query parameters
   */
  const filters = computed<JobFilter>(() => {
    const query = route.query
    
    return {
      search: (query.search as string) || undefined,
      status: (query.status as JobStatus) || undefined,
      company: (query.company as string) || undefined,
      location: (query.location as string) || undefined,
    }
  })
  
  /**
   * Update filters and sync with URL
   */
  const updateFilters = (newFilters: Partial<JobFilter>) => {
    const query: Record<string, string | number | undefined> = { ...route.query }
    
    // Update query params with new filters
    if (newFilters.search !== undefined) {
      if (newFilters.search && newFilters.search.trim()) {
        query.search = newFilters.search.trim()
      } else {
        delete query.search
      }
    }
    
    if (newFilters.status !== undefined) {
      if (newFilters.status) {
        query.status = newFilters.status
      } else {
        delete query.status
      }
    }
    
    if (newFilters.company !== undefined) {
      if (newFilters.company && newFilters.company.trim()) {
        query.company = newFilters.company.trim()
      } else {
        delete query.company
      }
    }
    
    if (newFilters.location !== undefined) {
      if (newFilters.location && newFilters.location.trim()) {
        query.location = newFilters.location.trim()
      } else {
        delete query.location
      }
    }
    
    // Reset pagination when filters change
    if (query.page) {
      query.page = '1'
    }
    
    router.push({ query })
  }
  
  /**
   * Reset all filters
   */
  const resetFilters = () => {
    router.push({ query: {} })
  }
  
  /**
   * Check if any filters are active
   */
  const hasActiveFilters = computed(() => {
    const f = filters.value
    return !!(
      f.search ||
      f.status ||
      f.company ||
      f.location
    )
  })
  
  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
  }
}

