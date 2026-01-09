/**
 * Job API Utilities
 * API utility functions for job-related operations
 * Stateless functions - no reactive state
 */
import type { Job, CreateJobInput, JobFilter } from '@job/types/job'
import type { ApiResponse } from '@/types/api-response'
import { logError } from '@shared/logging'

export const useJob = () => {
  const { $api } = useNuxtApp()

  const getJobs = async (filters?: JobFilter): Promise<Job[]> => {
    try {
      const response = await $api<ApiResponse<Job[]>>('/api/jobs', {
        method: 'GET',
        query: filters,
      })
      return response.data || []
    } catch (error) {
      logError('Error fetching jobs', error, 'job-api')
      return []
    }
  }

  const getJobById = async (id: string): Promise<Job | null> => {
    try {
      const response = await $api<ApiResponse<Job>>(`/api/jobs/${id}`, {
        method: 'GET',
      })
      return response.data || null
    } catch (error) {
      logError('Error fetching job', error, 'job-api')
      return null
    }
  }

  const createJob = async (input: CreateJobInput): Promise<Job | null> => {
    try {
      const response = await $api<ApiResponse<Job>>('/api/jobs', {
        method: 'POST',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error creating job', error, 'job-api')
      throw error
    }
  }

  const updateJob = async (id: string, input: Partial<CreateJobInput> & { status?: Job['status'] }): Promise<Job | null> => {
    try {
      const response = await $api<ApiResponse<Job>>(`/api/jobs/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response.data
    } catch (error) {
      logError('Error updating job', error, 'job-api')
      throw error
    }
  }

  const deleteJob = async (id: string): Promise<void> => {
    try {
      await $api(`/api/jobs/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      logError('Error deleting job', error, 'job-api')
      throw error
    }
  }

  /**
   * Parse job from text input using AI
   * Uses $fetch for client-side API call
   */
  const parseJobFromText = async (text: string, link?: string): Promise<Job | null> => {
    try {
      const response = await $api<ApiResponse<Job>>('/api/jobs/parse', {
        method: 'POST',
        body: { text, link },
      })
      return response.data
    } catch (error) {
      logError('Error parsing job from text', error, 'job-api')
      throw error
    }
  }

  /**
   * Get filter options for job filters
   */
  const getFilterOptions = async () => {
    try {
      const response = await $api<ApiResponse<import('@job/types/job').JobFilterOptions>>('/api/jobs/filter-options', {
        method: 'GET',
      })
      return response.data
    } catch (error) {
      logError('Error fetching filter options', error, 'job-api')
      throw error
    }
  }

  return {
    getJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    parseJobFromText,
    getFilterOptions,
  }
}

