import { DASHBOARD_ROLE, type DashboardRole } from '@dashboard/constants/roles'

export function useDashboardRole() {
  const route = useRoute()

  const role = ref<DashboardRole>(DASHBOARD_ROLE.RECRUITER)

  watchEffect(() => {
    const fromQuery = route.query.role
    if (typeof fromQuery === 'string') {
      const allowed = Object.values(DASHBOARD_ROLE) as string[]
      if (allowed.includes(fromQuery)) role.value = fromQuery as DashboardRole
    }
  })

  return { role }
}


