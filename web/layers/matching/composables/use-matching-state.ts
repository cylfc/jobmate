/**
 * Use Matching State Composable
 * Manages state for matching workflow (steps, selected items, matchings)
 */
import type { Job, Candidate, Matching } from '@matching/types/matching'

export const useMatchingState = () => {
  const currentStep = ref(1)
  const selectedJob = ref<Job | null>(null)
  const selectedCandidates = ref<Candidate[]>([])
  const matchings = ref<(Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]>([])

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
  }

  return {
    currentStep,
    selectedJob,
    selectedCandidates,
    matchings,
    nextStep,
    previousStep,
    goToStep,
    reset,
  }
}

