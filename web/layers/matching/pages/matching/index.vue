<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container mx-auto space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">{{ t('matching.title') }}</h1>
      <p class="text-gray-600">{{ t('matching.subtitle') }}</p>
    </div>

    <MatchingStepper
      :current-step="currentStep"
      @update:current-step="goToStep"
    />

    <div class="bg-white rounded-lg shadow-sm p-6">
      <StepsStep1JobInput
        v-if="currentStep === 1"
        :job="selectedJob"
        @update:job="selectedJob = $event"
        @next="handleNext"
        @save-job="showSaveJobModal = true"
      />

      <StepsStep2CandidateInput
        v-if="currentStep === 2"
        :candidates="selectedCandidates"
        @update:candidates="selectedCandidates = $event"
        @next="handleNext"
        @previous="handlePrevious"
        @save-candidate="showSaveCandidateModal = true"
      />

      <StepsStep3Analysis
        v-if="currentStep === 3"
        :is-analyzing="isAnalyzing"
        :analysis-progress="analysisProgress"
        :matchings-count="matchings.length"
        @next="handleNext"
        @previous="handlePrevious"
      />

      <StepsStep4Results
        v-if="currentStep === 4"
        :matchings="matchings"
        @previous="handlePrevious"
        @reset="handleReset"
        @save-candidate="handleSaveCandidateFromResults"
        @refresh="handleRefreshMatchings"
        @update:matchings="matchings = $event"
      />
    </div>

    <ModalsSaveJobModal
      v-model="showSaveJobModal"
      :job="selectedJob"
      @save="handleSaveJob"
    />

    <ModalsSaveCandidateModal
      v-model="showSaveCandidateModal"
      :candidate="selectedCandidateForSave"
      @save="handleSaveCandidate"
    />
  </div>
</template>

<script setup lang="ts">
import type { Candidate, Matching } from '@matching/types/matching'

const { t } = useI18n()

definePageMeta({
  layout: 'dashboard',
})

const {
  currentStep,
  selectedJob,
  selectedCandidates,
  matchings,
  isAnalyzing,
  analysisProgress,
  analyzeMatchings,
  getMatchings,
  nextStep,
  previousStep,
  goToStep,
  reset,
} = useMatching()

const showSaveJobModal = ref(false)
const showSaveCandidateModal = ref(false)
const selectedCandidateForSave = ref<Candidate | null>(null)

const handleNext = async () => {
  if (currentStep.value === 2) {
    // Start analysis when moving from step 2 to step 3
    if (selectedJob.value && selectedCandidates.value.length > 0) {
      await analyzeMatchings(selectedJob.value, selectedCandidates.value)
    }
  }
  nextStep()
}

const handlePrevious = () => {
  previousStep()
}

const handleReset = () => {
  reset()
}

const handleSaveJob = () => {
  showSaveJobModal.value = false
  // Job is saved via the modal
}

const handleSaveCandidate = () => {
  selectedCandidateForSave.value = null
  showSaveCandidateModal.value = false
  // Candidate is saved via the modal
}

const handleSaveCandidateFromResults = (_matching: Matching) => {
  // TODO: Extract candidate data from matching
  selectedCandidateForSave.value = null
  showSaveCandidateModal.value = true
}

const handleRefreshMatchings = async () => {
  // Refresh matchings by re-analyzing with current job and candidates
  if (selectedJob.value && selectedCandidates.value.length > 0) {
      await analyzeMatchings(selectedJob.value, selectedCandidates.value)
      // matchings.value is updated by analyzeMatchings, which will trigger props update in Step 4
      console.log('Parent - Refreshed matchings:', matchings.value)
  } else {
    // If no job/candidates, try to get from API
    const apiMatchings = await getMatchings()
    if (apiMatchings && apiMatchings.length > 0) {
      matchings.value = apiMatchings
    }
  }
}
</script>
