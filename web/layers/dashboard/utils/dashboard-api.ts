/**
 * Dashboard API Utilities
 * API utility functions for dashboard-related operations
 * Stateless functions - no reactive state
 */
import type {
  DashboardKpisResponse,
  ActiveJobsApiResponse,
  DashboardAlertsApiResponse,
  MatchingHealthApiResponse,
  CandidatePipelineApiResponse,
  RecentActivitiesResponse,
} from '@dashboard/types/dashboard'

export interface UseRecentActivitiesOptions {
  cursor?: string | null
  limit?: number
}

export const useDashboardApi = () => {
  const { $api } = useNuxtApp()

  /**
   * Get dashboard KPIs
   */
  const getKpis = async (): Promise<DashboardKpisResponse> => {
    try {
      const response = await $api<DashboardKpisResponse>('/api/dashboard/kpis', {
        method: 'GET',
      })
      return response
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error)
      throw error
    }
  }

  /**
   * Get active jobs
   */
  const getActiveJobs = async (): Promise<ActiveJobsApiResponse> => {
    try {
      const response = await $api<ActiveJobsApiResponse>('/api/dashboard/active-jobs', {
        method: 'GET',
      })
      return response
    } catch (error) {
      console.error('Error fetching active jobs:', error)
      throw error
    }
  }

  /**
   * Get dashboard alerts
   */
  const getAlerts = async (): Promise<DashboardAlertsApiResponse> => {
    try {
      const response = await $api<DashboardAlertsApiResponse>('/api/dashboard/alerts', {
        method: 'GET',
      })
      return response
    } catch (error) {
      console.error('Error fetching dashboard alerts:', error)
      throw error
    }
  }

  /**
   * Get matching health data
   */
  const getMatchingHealth = async (): Promise<MatchingHealthApiResponse> => {
    try {
      const response = await $api<MatchingHealthApiResponse>('/api/dashboard/matching-health', {
        method: 'GET',
      })
      return response
    } catch (error) {
      console.error('Error fetching matching health:', error)
      throw error
    }
  }

  /**
   * Get candidate pipeline data
   */
  const getCandidatePipeline = async (): Promise<CandidatePipelineApiResponse> => {
    try {
      const response = await $api<CandidatePipelineApiResponse>('/api/dashboard/pipeline', {
        method: 'GET',
      })
      return response
    } catch (error) {
      console.error('Error fetching candidate pipeline:', error)
      throw error
    }
  }

  /**
   * Get recent activities
   */
  const getRecentActivities = async (
    options: UseRecentActivitiesOptions = {}
  ): Promise<RecentActivitiesResponse> => {
    try {
      const limit = Number.isFinite(Number(options.limit))
        ? Math.max(1, Math.trunc(Number(options.limit)))
        : 20
      const cursor = options.cursor ?? undefined

      const response = await $api<RecentActivitiesResponse>('/api/dashboard/activities', {
        method: 'GET',
        query: {
          limit,
          cursor,
        },
      })
      return response
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      throw error
    }
  }

  return {
    getKpis,
    getActiveJobs,
    getAlerts,
    getMatchingHealth,
    getCandidatePipeline,
    getRecentActivities,
  }
}

