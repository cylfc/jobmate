/**
 * Use Matching State Composable
 * Manages state for matching workflow (steps, selected items, matchings)
 * Layer 2: Shared composable with createSharedComposable
 */
import { createSharedComposable } from '@vueuse/core'
import type { Job, Candidate, Matching } from '@matching/types/matching'

const _useMatchingState = () => {
  const currentStep = ref(1)
  const selectedJob = ref<Job | null>(null)
  const selectedCandidates = reactive<Candidate[]>([])
  const matchings = reactive<(Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]>([])

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
    selectedCandidates.splice(0, selectedCandidates.length)
    matchings.splice(0, matchings.length)
  }

  onUnmounted(() => {
    // Optional cleanup
  })

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

export const useMatchingState = createSharedComposable(_useMatchingState)

