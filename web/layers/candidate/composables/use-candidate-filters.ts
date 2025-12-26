/**
 * Use Candidate Filters Composable
 * Manages candidate filters with URL query parameter synchronization
 * Uses Layer 3: Query Parameters for shareable state
 */
import type { CandidateFilter, CandidateStatus } from '@candidate/types/candidate'

export const useCandidateFilters = () => {
  const route = useRoute()
  const router = useRouter()
  
  /**
   * Computed filters synced with URL query parameters
   */
  const filters = computed<CandidateFilter>(() => {
    const query = route.query
    
    return {
      search: (query.search as string) || undefined,
      status: (query.status as CandidateStatus) || undefined,
      minExperience: query.minExperience ? Number(query.minExperience) : undefined,
      maxExperience: query.maxExperience ? Number(query.maxExperience) : undefined,
    }
  })
  
  /**
   * Update filters and sync with URL
   */
  const updateFilters = (newFilters: Partial<CandidateFilter>) => {
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
    
    if (newFilters.minExperience !== undefined) {
      if (newFilters.minExperience !== null && newFilters.minExperience !== '') {
        query.minExperience = Number(newFilters.minExperience)
      } else {
        delete query.minExperience
      }
    }
    
    if (newFilters.maxExperience !== undefined) {
      if (newFilters.maxExperience !== null && newFilters.maxExperience !== '') {
        query.maxExperience = Number(newFilters.maxExperience)
      } else {
        delete query.maxExperience
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
      f.minExperience !== undefined ||
      f.maxExperience !== undefined
    )
  })
  
  return {
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
  }
}

