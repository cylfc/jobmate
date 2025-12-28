<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container mx-auto space-y-6">
    <div>
      <h1 class="text-3xl font-bold mb-2">{{ t('matching.title') }}</h1>
      <p class="text-muted">{{ t('matching.subtitle') }}</p>
    </div>

    <MatchingStepper
      :current-step="currentStep"
      @update:current-step="goToStep"
    />

    <div class="bg-default rounded-lg shadow-sm p-6">
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
        @update:matchings="matchings.splice(0, matchings.length, ...$event)"
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
import { useMatchingState } from '@matching/composables/use-matching-state'
import { useMatchingAnalysis } from '@matching/composables/use-matching-analysis'
import { useJob } from '@job/utils/job-api'
import { useCandidate } from '@candidate/utils/candidate-api'

const { t } = useI18n()

definePageMeta({
  layout: 'dashboard',
  middleware: '01-auth',
})

const {
  currentStep,
  selectedJob,
  selectedCandidates,
  matchings,
  nextStep,
  previousStep,
  goToStep,
  reset,
} = useMatchingState()

const {
  isAnalyzing,
  analysisProgress,
  analyzeMatchings,
  getMatchings,
} = useMatchingAnalysis()

const showSaveJobModal = ref(false)
const showSaveCandidateModal = ref(false)
const selectedCandidateForSave = ref<Candidate | null>(null)
const route = useRoute()
const { getJobById } = useJob()
const { getCandidateById } = useCandidate()

const handleNext = async () => {
  if (currentStep.value === 2) {
    // Start analysis when moving from step 2 to step 3
    if (selectedJob.value && selectedCandidates.length > 0) {
      const result = await analyzeMatchings(selectedJob.value, selectedCandidates)
      // Update matchings in state
      matchings.splice(0, matchings.length, ...result)
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
  if (selectedJob.value && selectedCandidates.length > 0) {
      const result = await analyzeMatchings(selectedJob.value, selectedCandidates)
      // Update matchings in state
      matchings.splice(0, matchings.length, ...result)
      console.log('Parent - Refreshed matchings:', matchings)
  } else {
    // If no job/candidates, try to get from API
    const apiMatchings = await getMatchings()
    if (apiMatchings && apiMatchings.length > 0) {
      matchings.splice(0, matchings.length, ...apiMatchings)
    }
  }
}

// Handle prefill from query params
onMounted(async () => {
  const prefill = route.query.prefill as string | undefined
  const jobId = route.query.jobId as string | undefined
  const candidateId = route.query.candidateId as string | undefined

  if (prefill === 'job' && jobId) {
    // Prefill job from job layer
    const job = await getJobById(jobId)
    if (job) {
      selectedJob.value = {
        id: job.id,
        title: job.title,
        description: job.description,
        company: job.company,
        domain: job.domain,
        location: job.location,
        requirements: job.requirements,
        salary: job.salary,
        link: job.link,
        status: job.status,
      }
      // Navigate to step 2 to continue with candidate selection
      goToStep(2)
    }
  } else if (prefill === 'candidate' && candidateId) {
    // Prefill candidate from candidate layer
    const candidate = await getCandidateById(candidateId)
    if (candidate) {
      selectedCandidates.splice(0, selectedCandidates.length, {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        skills: candidate.skills,
        experience: candidate.experience,
        status: candidate.status,
      })
      // Stay at step 1 to select job, then candidate is already selected
      goToStep(1)
    }
  }
})
</script>
