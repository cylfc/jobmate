/**
 * Create Candidate State Store
 * Pinia store for managing create candidate script state
 */
import { defineStore } from 'pinia'
import type { CreateCandidateState, CreateCandidateInputMethod } from '@chat/types/create-candidate'
import type { CreateCandidateInput } from '@candidate/types/candidate'
import type { Candidate } from '@candidate/types/candidate'

export const useCreateCandidateStateStore = defineStore('createCandidateState', {
  state: (): CreateCandidateState => ({
    currentStep: 0,
    inputMethod: null,
    rawInput: {
      text: undefined,
      files: undefined,
    },
    parsedCandidate: null,
    errors: {},
    isParsing: false,
    isSaving: false,
    createdCandidate: null,
  }),

  getters: {
    /**
     * Check if current step is valid and can proceed
     */
    canProceed: (state): boolean => {
      // Can proceed if no errors and required data is present
      return Object.keys(state.errors).length === 0
    },

    /**
     * Check if state has any errors
     */
    hasErrors: (state): boolean => {
      return Object.keys(state.errors).length > 0
    },

    /**
     * Check if candidate data is valid
     */
    isValid: (state): boolean => {
      if (!state.parsedCandidate) return false
      const { firstName, lastName, email } = state.parsedCandidate
      return !!(firstName && lastName && email)
    },

    /**
     * Get current input data (text or files)
     */
    hasInput: (state): boolean => {
      return !!(state.rawInput.text || (state.rawInput.files && state.rawInput.files.length > 0))
    },
  },

  actions: {
    /**
     * Set current step
     */
    setCurrentStep(step: number) {
      this.currentStep = step
    },

    /**
     * Set input method
     */
    setInputMethod(method: CreateCandidateInputMethod) {
      this.inputMethod = method
    },

    /**
     * Set raw text input
     */
    setRawText(text: string) {
      this.rawInput.text = text
    },

    /**
     * Set raw files input
     */
    setRawFiles(files: File[]) {
      this.rawInput.files = files
    },

    /**
     * Set parsed candidate data
     */
    setParsedCandidate(candidate: CreateCandidateInput | null) {
      this.parsedCandidate = candidate
    },

    /**
     * Set validation errors
     */
    setErrors(errors: Record<string, string>) {
      this.errors = errors
    },

    /**
     * Set single error
     */
    setError(key: string, message: string) {
      this.errors[key] = message
    },

    /**
     * Clear error
     */
    clearError(key: string) {
      delete this.errors[key]
    },

    /**
     * Clear all errors
     */
    clearErrors() {
      this.errors = {}
    },

    /**
     * Set parsing state
     */
    setParsing(isParsing: boolean) {
      this.isParsing = isParsing
    },

    /**
     * Set saving state
     */
    setSaving(isSaving: boolean) {
      this.isSaving = isSaving
    },

    /**
     * Set created candidate
     */
    setCreatedCandidate(candidate: Candidate | null) {
      this.createdCandidate = candidate
    },

    /**
     * Reset store to initial state
     */
    reset() {
      this.currentStep = 0
      this.inputMethod = null
      this.rawInput = {
        text: undefined,
        files: undefined,
      }
      this.parsedCandidate = null
      this.errors = {}
      this.isParsing = false
      this.isSaving = false
      this.createdCandidate = null
    },
  },
})

