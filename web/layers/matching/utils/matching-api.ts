/**
 * Matching API Utilities
 * API utility functions for matching-related operations
 * Stateless functions - no reactive state
 */
import type { Job, Candidate, Matching, CreateJobInput, CreateCandidateInput, CandidateFilter } from '@matching/types/matching'

export const useMatchingApi = () => {
  /**
   * Parse job from text input
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
   */
  const getJobsFromDatabase = async (): Promise<Job[]> => {
    try {
      const response = await $fetch<{ jobs: Job[] }>('/api/matching/jobs', {
        method: 'GET',
      })
      return response.jobs || []
    } catch (error) {
      console.error('Error fetching jobs from database:', error)
      return []
    }
  }

  /**
   * Save job to database
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

  /**
   * Parse candidates from text input
   */
  const parseCandidatesFromText = async (text: string): Promise<Candidate[]> => {
    try {
      const { candidates } = await $fetch<{ candidates: Candidate[] }>('/api/matching/candidates', {
        method: 'POST',
        body: {
          text,
        },
      })
      return candidates
    } catch (error) {
      console.error('Error parsing candidates from text:', error)
      throw error
    }
  }

  /**
   * Get candidates from database with filters
   */
  const getCandidatesFromDatabase = async (filters?: CandidateFilter): Promise<Candidate[]> => {
    try {
      const queryParams = new URLSearchParams()
      if (filters?.status) queryParams.append('status', filters.status)
      if (filters?.minExperience !== undefined) queryParams.append('minExperience', filters.minExperience.toString())
      if (filters?.maxExperience !== undefined) queryParams.append('maxExperience', filters.maxExperience.toString())
      if (filters?.skills && filters.skills.length > 0) {
        filters.skills.forEach((skill: string) => queryParams.append('skills', skill))
      }

      const queryString = queryParams.toString()
      const url = `/api/matching/candidates${queryString ? `?${queryString}` : ''}`

      const response = await $fetch<{ candidates: Candidate[] }>(url, {
        method: 'GET',
      })

      return response.candidates || []
    } catch (error) {
      console.error('Error fetching candidates from database:', error)
      return []
    }
  }

  /**
   * Save candidate to database
   */
  const saveCandidate = async (candidateInput: CreateCandidateInput): Promise<Candidate | null> => {
    try {
      // TODO: Implement save candidate API endpoint
      // For now, return a mock candidate
      const candidate: Candidate = {
        id: `candidate-${Date.now()}`,
        ...candidateInput,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      return candidate
    } catch (error) {
      console.error('Error saving candidate:', error)
      return null
    }
  }

  /**
   * Analyze job-candidate matches
   */
  const analyzeMatchings = async (
    job: Job,
    candidates: Candidate[]
  ): Promise<(Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]> => {
    try {
      const { matchings } = await $fetch<{
        matchings: (Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]
      }>('/api/matching/analyze', {
        method: 'POST',
        body: {
          job,
          candidates,
        },
      })
      return matchings || []
    } catch (error) {
      console.error('Error analyzing matchings:', error)
      throw error
    }
  }

  /**
   * Get matchings
   */
  const getMatchings = async (): Promise<
    (Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]
  > => {
    try {
      const response = await $fetch<{
        matchings: (Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]
      }>('/api/matching/matchings', {
        method: 'GET',
      })
      return response.matchings || []
    } catch (error) {
      console.error('Error fetching matchings:', error)
      return []
    }
  }

  /**
   * Create matching
   */
  const createMatching = async (_candidateId: string, _jobId: string): Promise<Matching | null> => {
    try {
      // TODO: Implement create matching API endpoint
      return null
    } catch (error) {
      console.error('Error creating matching:', error)
      return null
    }
  }

  return {
    // Job APIs
    parseJobFromText,
    getJobsFromDatabase,
    saveJob,
    // Candidate APIs
    parseCandidatesFromText,
    getCandidatesFromDatabase,
    saveCandidate,
    // Analysis APIs
    analyzeMatchings,
    getMatchings,
    createMatching,
  }
}

