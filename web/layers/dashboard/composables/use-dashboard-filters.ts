/**
 * Use Dashboard Filters Composable
 * Manages dashboard filters with URL query parameter synchronization
 * Uses Layer 3: Query Parameters for shareable state
 */
import { DASHBOARD_ROLE, type DashboardRole } from '@dashboard/constants/roles'

export const useDashboardFilters = () => {
  const route = useRoute()
  const router = useRouter()
  
  /**
   * Computed role synced with URL query parameters
   */
  const role = computed<DashboardRole>(() => {
    const fromQuery = route.query.role
    if (typeof fromQuery === 'string') {
      const allowed = Object.values(DASHBOARD_ROLE) as string[]
      if (allowed.includes(fromQuery)) {
        return fromQuery as DashboardRole
      }
    }
    return DASHBOARD_ROLE.RECRUITER // default
  })
  
  /**
   * Update role and sync with URL
   */
  const updateRole = (newRole: DashboardRole) => {
    router.push({ query: { ...route.query, role: newRole } })
  }
  
  /**
   * Reset role (remove from URL)
   */
  const resetRole = () => {
    const { role: _, ...rest } = route.query
    router.push({ query: rest })
  }
  
  return {
    role,
    updateRole,
    resetRole,
  }
}

