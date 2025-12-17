export const DASHBOARD_ROLE = {
  RECRUITER: 'recruiter',
  HIRING_MANAGER: 'hiring-manager',
  ADMIN: 'admin',
} as const

export type DashboardRole = (typeof DASHBOARD_ROLE)[keyof typeof DASHBOARD_ROLE]


