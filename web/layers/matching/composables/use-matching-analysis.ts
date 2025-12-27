/**
 * Use Matching Analysis Composable
 * Handles all analysis-related operations for matching
 * Layer 2: Shared composable with createSharedComposable
 */
import { createSharedComposable } from '@vueuse/core'
import type { Job, Candidate, Matching } from '@matching/types/matching'
import { useMatchingApi } from '@matching/utils/matching-api'

const _useMatchingAnalysis = () => {
  const isAnalyzing = ref(false)
  const analysisProgress = ref(0)
  const api = useMatchingApi()

  /**
   * Analyze job-candidate matches
   * Uses API from utils with progress tracking
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
      const result = await api.analyzeMatchings(job, candidates)

      clearInterval(progressInterval)
      analysisProgress.value = 100

      // Wait a bit to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 300))

      return result
    } catch (error) {
      console.error('Error analyzing matchings:', error)
      throw error
    } finally {
      isAnalyzing.value = false
    }
  }

  /**
   * Get matchings
   */
  const getMatchings = async (): Promise<
    (Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]
  > => {
    return await api.getMatchings()
  }

  /**
   * Create matching
   */
  const createMatching = async (candidateId: string, jobId: string): Promise<Matching | null> => {
    return await api.createMatching(candidateId, jobId)
  }

  onUnmounted(() => {
    // Optional cleanup
  })

  return {
    isAnalyzing,
    analysisProgress,
    analyzeMatchings,
    getMatchings,
    createMatching,
  }
}

export const useMatchingAnalysis = createSharedComposable(_useMatchingAnalysis)

