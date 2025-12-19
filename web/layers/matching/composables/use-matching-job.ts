/**
 * Use Matching Job Composable
 * Handles all job-related operations for matching
 */
import type { Job, CreateJobInput } from '@matching/types/matching'

export const useMatchingJob = () => {
  /**
   * Parse job from text input
   * Uses $fetch for client-side API call
   */
  const parseJobFromText = async (description: string, link?: string): Promise<Job | null> => {
    try {
      const { job } = await $fetch<{ job: Job }>('/api/matching/jobs', {
        method: 'POST',
        body: {
          description,
          link,
        },
      })
      return job
    } catch (error) {
      console.error('Error parsing job from text:', error)
      throw error
    }
  }

  /**
   * Get jobs from database
   * Uses useAsyncData for SSR-safe data fetching
   */
  const getJobsFromDatabase = async (): Promise<Job[]> => {
    try {
      const { data } = await useAsyncData('matching:jobs', () =>
        $fetch<{ jobs: Job[] }>('/api/matching/jobs', {
          method: 'GET',
        })
      )

      return data.value?.jobs || []
    } catch (error) {
      console.error('Error fetching jobs from database:', error)
      return []
    }
  }

  /**
   * Save job to database
   * Uses $fetch for client-side API call
   */
  const saveJob = async (jobInput: CreateJobInput): Promise<Job | null> => {
    try {
      // TODO: Implement save job API endpoint
      // For now, return a mock job
      const job: Job = {
        id: `job-${Date.now()}`,
        ...jobInput,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      return job
    } catch (error) {
      console.error('Error saving job:', error)
      return null
    }
  }

  return {
    parseJobFromText,
    getJobsFromDatabase,
    saveJob,
  }
}

