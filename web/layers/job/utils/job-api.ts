/**
 * Job API Utilities
 * API utility functions for job-related operations
 * Stateless functions - no reactive state
 */
import type { Job, CreateJobInput, JobFilter } from '@job/types/job'

export const useJob = () => {
  const { $api } = useNuxtApp()

  const getJobs = async (filters?: JobFilter): Promise<Job[]> => {
    try {
      const response = await $api<{ jobs: Job[] }>('/api/jobs', {
        method: 'GET',
        query: filters,
      })
      return response.jobs || []
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return []
    }
  }

  const getJobById = async (id: string): Promise<Job | null> => {
    try {
      const response = await $api<{ job: Job }>(`/api/jobs/${id}`, {
        method: 'GET',
      })
      return response.job || null
    } catch (error) {
      console.error('Error fetching job:', error)
      return null
    }
  }

  const createJob = async (input: CreateJobInput): Promise<Job | null> => {
    try {
      const response = await $api<{ job: Job }>('/api/jobs', {
        method: 'POST',
        body: input,
      })
      return response.job
    } catch (error) {
      console.error('Error creating job:', error)
      throw error
    }
  }

  const updateJob = async (id: string, input: Partial<CreateJobInput> & { status?: Job['status'] }): Promise<Job | null> => {
    try {
      const response = await $api<{ job: Job }>(`/api/jobs/${id}`, {
        method: 'PUT',
        body: input,
      })
      return response.job
    } catch (error) {
      console.error('Error updating job:', error)
      throw error
    }
  }

  const deleteJob = async (id: string): Promise<void> => {
    try {
      await $api(`/api/jobs/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error deleting job:', error)
      throw error
    }
  }

  /**
   * Parse job from text input using AI
   * Uses $fetch for client-side API call
   */
  const parseJobFromText = async (text: string, link?: string): Promise<Job | null> => {
    try {
      const { job } = await $api<{ job: Job }>('/api/jobs/parse', {
        method: 'POST',
        body: { text, link },
      })
      return job
    } catch (error) {
      console.error('Error parsing job from text:', error)
      throw error
    }
  }

  /**
   * Get filter options for job filters
   */
  const getFilterOptions = async () => {
    try {
      const response = await $api<{ options: import('@job/types/job').JobFilterOptions }>('/api/jobs/filter-options', {
        method: 'GET',
      })
      return response.options
    } catch (error) {
      console.error('Error fetching filter options:', error)
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

