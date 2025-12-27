/**
 * Use Matching Analysis Composable
 * Handles all analysis-related operations for matching
 */
import type { Job, Candidate, Matching } from '@matching/types/matching'

export const useMatchingAnalysis = () => {
  const isAnalyzing = ref(false)
  const analysisProgress = ref(0)

  /**
   * Analyze job-candidate matches
   * Uses $fetch for client-side API call with progress tracking
   */
  const analyzeMatchings = async (
    job: Job,
    candidates: Candidate[]
  ): Promise<(Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]> => {
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
      const { matchings: analyzedMatchings } = await $fetch<{
        matchings: (Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]
      }>('/api/matching/analyze', {
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

      return analyzedMatchings
    } catch (error) {
      console.error('Error analyzing matchings:', error)
      throw error
    } finally {
      isAnalyzing.value = false
    }
  }

  /**
   * Get matchings
   * Uses $fetch for client-side API call (called after component mount)
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

  return {
    isAnalyzing: readonly(isAnalyzing),
    analysisProgress: readonly(analysisProgress),
    analyzeMatchings,
    getMatchings,
    createMatching,
  }
}

