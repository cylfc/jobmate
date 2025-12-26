/**
 * Use Create Candidate State Composable
 * Composable for accessing and manipulating create candidate state
 */
import { storeToRefs } from 'pinia'
import { useCreateCandidateStateStore } from '@chat/stores/create-candidate-state'
import type { Candidate } from '@candidate/types/candidate'
import type { CreateCandidateInput } from '@candidate/types/candidate'

export const useCreateCandidateState = () => {
  const store = useCreateCandidateStateStore()

  // Reactive state
  const {
    currentStep,
    inputMethod,
    rawInput,
    parsedCandidate,
    errors,
    isParsing,
    isSaving,
    createdCandidate,
  } = storeToRefs(store)

  // Getters
  const canProceed = computed(() => store.canProceed)
  const hasErrors = computed(() => store.hasErrors)
  const isValid = computed(() => store.isValid)
  const hasInput = computed(() => store.hasInput)

  // Actions
  const setCurrentStep = (step: number) => {
    store.setCurrentStep(step)
  }

  const setInputMethod = (method: 'text' | 'upload' | null) => {
    store.setInputMethod(method)
  }

  const setRawText = (text: string) => {
    store.setRawText(text)
  }

  const setRawFiles = (files: File[]) => {
    store.setRawFiles(files)
  }

  const setParsedCandidate = (candidate: CreateCandidateInput | null) => {
    store.setParsedCandidate(candidate)
  }

  const setErrors = (errors: Record<string, string>) => {
    store.setErrors(errors)
  }

  const setError = (key: string, message: string) => {
    store.setError(key, message)
  }

  const clearError = (key: string) => {
    store.clearError(key)
  }

  const clearErrors = () => {
    store.clearErrors()
  }

  const setParsing = (isParsing: boolean) => {
    store.setParsing(isParsing)
  }

  const setSaving = (isSaving: boolean) => {
    store.setSaving(isSaving)
  }

  const setCreatedCandidate = (candidate: Candidate | null) => {
    store.setCreatedCandidate(candidate)
  }

  const reset = () => {
    store.reset()
  }

  return {
    // State
    currentStep,
    inputMethod,
    rawInput,
    parsedCandidate,
    errors,
    isParsing,
    isSaving,
    createdCandidate,
    // Getters
    canProceed,
    hasErrors,
    isValid,
    hasInput,
    // Actions
    setCurrentStep,
    setInputMethod,
    setRawText,
    setRawFiles,
    setParsedCandidate,
    setErrors,
    setError,
    clearError,
    clearErrors,
    setParsing,
    setSaving,
    setCreatedCandidate,
    reset,
  }
}

