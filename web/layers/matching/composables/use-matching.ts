/**
 * Use Matching Composable
 * Composable for matching-related functionality
 * Uses Nuxt data fetching composables for enterprise-grade data management
 */
import type { Job, Candidate, Matching, CreateJobInput, CreateCandidateInput, CandidateFilter } from '@matching/types/matching'

export const useMatching = () => {
  const currentStep = ref(1)
  const selectedJob = ref<Job | null>(null)
  const selectedCandidates = ref<Candidate[]>([])
  const matchings = ref<(Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]>([])
  const isAnalyzing = ref(false)
  const analysisProgress = ref(0)

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
   * Parse candidates from text input
   * Uses $fetch for client-side API call
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
   * Get candidates from database with filters
   * Uses useAsyncData for SSR-safe data fetching
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

      const { data } = await useAsyncData(`matching:candidates:${queryString}`, () =>
        $fetch<{ candidates: Candidate[] }>(url, {
          method: 'GET',
        })
      )

      return data.value?.candidates || []
    } catch (error) {
      console.error('Error fetching candidates from database:', error)
      return []
    }
  }

  /**
   * Analyze job-candidate matches
   * Uses $fetch for client-side API call with progress tracking
   */
  const analyzeMatchings = async (job: Job, candidates: Candidate[]): Promise<(Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]> => {
    isAnalyzing.value = true
    analysisProgress.value = 0

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        if (analysisProgress.value < 90) {
          analysisProgress.value += 10
        }
      }, 500)

      // Call API to analyze matches
      const { matchings: analyzedMatchings } = await $fetch<{ matchings: (Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[] }>('/api/matching/analyze', {
        method: 'POST',
        body: {
          job,
          candidates,
        },
      })

      clearInterval(progressInterval)
      analysisProgress.value = 100

      // Wait a bit to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 300))

      matchings.value = analyzedMatchings
      return analyzedMatchings
    } catch (error) {
      console.error('Error analyzing matchings:', error)
      throw error
    } finally {
      isAnalyzing.value = false
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

  /**
   * Save candidate to database
   * Uses $fetch for client-side API call
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
   * Get matchings
   * Uses useAsyncData for SSR-safe data fetching
   */
  const getMatchings = async (): Promise<(Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]> => {
    try {
      const { data } = await useAsyncData('matching:matchings', () =>
        $fetch<{ matchings: (Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[] }>('/api/matching/matchings', {
          method: 'GET',
        })
      )

      return data.value?.matchings || []
    } catch (error) {
      console.error('Error fetching matchings:', error)
      return []
    }
  }

  /**
   * Create matching
   * Uses $fetch for client-side API call
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

  const nextStep = () => {
    if (currentStep.value < 4) {
      currentStep.value++
    }
  }

  const previousStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      currentStep.value = step
    }
  }

  const reset = () => {
    currentStep.value = 1
    selectedJob.value = null
    selectedCandidates.value = []
    matchings.value = []
    isAnalyzing.value = false
    analysisProgress.value = 0
  }

  return {
    currentStep,
    selectedJob,
    selectedCandidates,
    matchings,
    isAnalyzing,
    analysisProgress,
    parseJobFromText,
    parseCandidatesFromText,
    getJobsFromDatabase,
    getCandidatesFromDatabase,
    analyzeMatchings,
    saveJob,
    saveCandidate,
    getMatchings,
    createMatching,
    nextStep,
    previousStep,
    goToStep,
    reset,
  }
}
