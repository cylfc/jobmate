/**
 * Use Matching Composable
 * Main composable that combines all matching-related functionality
 * Uses smaller, focused composables for better separation of concerns
 */
import { useMatchingState } from './use-matching-state'
import { useMatchingJob } from './use-matching-job'
import { useMatchingCandidate } from './use-matching-candidate'
import { useMatchingAnalysis } from './use-matching-analysis'
import type { Job, Candidate } from '@matching/types/matching'

export const useMatching = () => {
  // State management
  const state = useMatchingState()

  // Job operations
  const jobOps = useMatchingJob()

  // Candidate operations
  const candidateOps = useMatchingCandidate()

  // Analysis operations
  const analysisOps = useMatchingAnalysis()

  /**
   * Analyze matchings and update state
   * Wrapper that combines analysis with state management
   */
  const analyzeMatchings = async (job: Job, candidates: Candidate[]) => {
    const result = await analysisOps.analyzeMatchings(job, candidates)
    state.matchings.value = result
    return result
  }

  return {
    // State
    currentStep: state.currentStep,
    selectedJob: state.selectedJob,
    selectedCandidates: state.selectedCandidates,
    matchings: state.matchings,
    isAnalyzing: analysisOps.isAnalyzing,
    analysisProgress: analysisOps.analysisProgress,

    // Job operations
    parseJobFromText: jobOps.parseJobFromText,
    getJobsFromDatabase: jobOps.getJobsFromDatabase,
    saveJob: jobOps.saveJob,

    // Candidate operations
    parseCandidatesFromText: candidateOps.parseCandidatesFromText,
    getCandidatesFromDatabase: candidateOps.getCandidatesFromDatabase,
    saveCandidate: candidateOps.saveCandidate,

    // Analysis operations
    analyzeMatchings,
    getMatchings: analysisOps.getMatchings,
    createMatching: analysisOps.createMatching,

    // State management
    nextStep: state.nextStep,
    previousStep: state.previousStep,
    goToStep: state.goToStep,
    reset: state.reset,
  }
}
