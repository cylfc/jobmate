<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold mb-2">{{ t('matching.step-2.title') }}</h2>
      <p class="text-gray-600">{{ t('matching.step-2.description') }}</p>
    </div>

    <div class="space-y-4">
      <div v-if="selectedMode === CANDIDATE_INPUT_MODE.INPUT" class="space-y-4">
        <UFormField :label="t('matching.step-2.candidate-information')" name="candidateText" class="w-full">
          <UTextarea
            v-model="candidateText"
            :placeholder="t('matching.step-2.candidate-placeholder')"
            :rows="10"
            class="w-full"
          />
          <template #hint>
            <p class="text-sm text-gray-500 mt-1">
              {{ t('matching.step-2.candidate-hint') }}
            </p>
          </template>
        </UFormField>
      </div>

      <div v-else-if="selectedMode === CANDIDATE_INPUT_MODE.UPLOAD" class="space-y-4">
        <UFormField :label="t('matching.step-2.upload-cvs')" name="cvs" class="w-full">
          <UInput
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            class="w-full"
            @change="handleFileUpload"
          />
          <template #hint>
            <p class="text-sm text-gray-500 mt-1">
              {{ t('matching.step-2.upload-hint') }}
            </p>
          </template>
        </UFormField>

        <div v-if="uploadedFiles.length > 0" class="space-y-2">
          <p class="text-sm font-medium">{{ t('matching.step-2.uploaded-files') }}</p>
          <div class="space-y-2">
            <div
              v-for="(file, index) in uploadedFiles"
              :key="index"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-file" class="w-5 h-5 text-gray-500" />
                <span class="text-sm">{{ file.name }}</span>
              </div>
              <UButton
                color="red"
                variant="ghost"
                size="xs"
                icon="i-lucide-trash"
                @click="removeFile(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="selectedMode === CANDIDATE_INPUT_MODE.DATABASE" class="space-y-4">
        <UFormField :label="t('matching.step-2.filter-candidates')" name="filters" class="w-full">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField :label="t('matching.step-2.status')" name="status" class="w-full">
              <USelectMenu
                v-model="filters.status"
                :options="statusOptions"
                :placeholder="t('matching.step-2.select-status')"
                clearable
                class="w-full"
              />
            </UFormField>
            <UFormField :label="t('matching.step-2.min-experience')" name="minExperience" class="w-full">
              <UInput
                v-model.number="filters.minExperience"
                type="number"
                :placeholder="t('matching.step-2.min-experience-placeholder')"
                class="w-full"
              />
            </UFormField>
          </div>
        </UFormField>

        <UButton
          color="primary"
          variant="outline"
          icon="i-lucide-search"
          @click="loadCandidates"
        >
          {{ t('matching.step-2.load-candidates') }}
        </UButton>

        <div v-if="candidatesFromDatabase.length > 0" class="space-y-2">
          <p class="text-sm font-medium">{{ t('matching.step-2.select-candidates') }}</p>
          <div class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="candidate in candidatesFromDatabase"
              :key="candidate.id"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p class="font-medium">{{ `${candidate.firstName} ${candidate.lastName}` }}</p>
                <p class="text-sm text-gray-500">{{ candidate.email }}</p>
              </div>
              <UCheckbox
                :model-value="isSelected(candidate.id)"
                @update:model-value="toggleCandidate(candidate)"
              />
            </div>
          </div>
        </div>
      </div>

      <USeparator class="my-4" />

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="tab in tabs"
          :key="tab.value"
          :color="selectedMode === tab.value ? 'primary' : 'neutral'"
          :variant="selectedMode === tab.value ? 'solid' : 'outline'"
          :icon="tab.icon"
          @click="selectedMode = tab.value"
        >
          {{ tab.label }}
        </UButton>
      </div>
    </div>

    <div v-if="selectedCandidates.length > 0" class="p-4 bg-primary-50 rounded-lg">
      <p class="text-sm font-medium mb-2">
        {{ t('matching.step-2.selected-candidates', { count: selectedCandidates.length }) }}
      </p>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="(candidate, index) in selectedCandidates"
          :key="index"
          color="primary"
          variant="subtle"
        >
          {{ getCandidateName(candidate) }}
        </UBadge>
      </div>
    </div>

    <USeparator class="my-4" />

    <div class="flex items-center justify-between">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-arrow-left"
        @click="$emit('previous')"
      >
        {{ t('matching.step-2.previous') }}
      </UButton>
      <div class="flex gap-2">
        <UButton
          v-if="canSaveCandidate"
          color="neutral"
          variant="outline"
          icon="i-lucide-save"
          @click="openSaveCandidateModal"
        >
          {{ t('matching.step-2.save-candidates') }}
        </UButton>
        <UButton
          color="primary"
          :disabled="!canProceed || isProcessing"
          :loading="isProcessing"
          icon="i-lucide-arrow-right"
          @click="handleNext"
        >
          {{ isProcessing ? t('matching.step-2.processing') : t('matching.step-2.next-step') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Candidate, CandidateFilter } from '@matching/types/matching'
import { CANDIDATE_INPUT_MODE, type CandidateInputMode } from '@matching/constants/modes'

const { t } = useI18n()

interface Props {
  candidates: Candidate[]
}

interface Emits {
  (e: 'update:candidates', value: Candidate[]): void
  (e: 'next'): void
  (e: 'previous'): void
  (e: 'save-candidate'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getCandidatesFromDatabase, parseCandidatesFromText } = useMatching()

const selectedMode = ref<CandidateInputMode>(CANDIDATE_INPUT_MODE.INPUT)
const uploadedFiles = ref<File[]>([])
const selectedCandidates = ref<Candidate[]>([])
const candidatesFromDatabase = ref<Candidate[]>([])
const filters = ref<CandidateFilter>({})
const candidateText = ref('')
const isProcessing = ref(false)

const tabs = computed(() => [
  { label: t('matching.step-2.input'), value: CANDIDATE_INPUT_MODE.INPUT, icon: 'i-lucide-pencil' },
  { label: t('matching.step-2.upload-cvs-label'), value: CANDIDATE_INPUT_MODE.UPLOAD, icon: 'i-lucide-file-up' },
  { label: t('matching.step-2.from-database'), value: CANDIDATE_INPUT_MODE.DATABASE, icon: 'i-lucide-database' },
])

const statusOptions = computed(() => [
  { label: t('matching.status.active'), value: 'active' },
  { label: t('matching.status.inactive'), value: 'inactive' },
  { label: t('matching.status.archived'), value: 'archived' },
])

const canProceed = computed(() => {
  if (selectedMode.value === CANDIDATE_INPUT_MODE.INPUT) {
    return candidateText.value.trim().length > 0
  }
  if (selectedMode.value === CANDIDATE_INPUT_MODE.UPLOAD) return uploadedFiles.value.length > 0
  if (selectedMode.value === CANDIDATE_INPUT_MODE.DATABASE) return selectedCandidates.value.length > 0
  return false
})

const canSaveCandidate = computed(() => {
  return uploadedFiles.value.length > 0 || candidateText.value.trim().length > 0
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    uploadedFiles.value = Array.from(target.files)
    
    // Create candidate objects from uploaded files
    const newCandidates: Candidate[] = Array.from(target.files).map(file => ({
      firstName: file.name.split('.')[0],
      lastName: '',
      email: '',
      skills: [],
      experience: 0,
      cvFile: file,
    }))
    
    selectedCandidates.value = [...selectedCandidates.value, ...newCandidates]
  }
}

const removeFile = (index: number) => {
  uploadedFiles.value.splice(index, 1)
  // Remove corresponding candidate from selectedCandidates
  const fileCandidates = selectedCandidates.value.filter(c => c.cvFile)
  if (fileCandidates[index]) {
    const candidateToRemove = fileCandidates[index]
    const candidateIndex = selectedCandidates.value.findIndex(c => c === candidateToRemove)
    if (candidateIndex >= 0) {
      selectedCandidates.value.splice(candidateIndex, 1)
    }
  }
}

const loadCandidates = async () => {
  candidatesFromDatabase.value = await getCandidatesFromDatabase(filters.value)
}

const isSelected = (id?: string) => {
  if (!id) return false
  return selectedCandidates.value.some(c => c.id === id)
}

const toggleCandidate = (candidate: Candidate) => {
  if (!candidate.id) return
  
  const index = selectedCandidates.value.findIndex(c => c.id === candidate.id)
  if (index >= 0) {
    selectedCandidates.value.splice(index, 1)
  } else {
    selectedCandidates.value.push(candidate)
  }
}

const getCandidateName = (candidate: Candidate) => {
  if (candidate.firstName || candidate.lastName) {
    return `${candidate.firstName} ${candidate.lastName}`.trim()
  }
  return candidate.email || t('common.unknown')
}

const handleNext = async () => {
  // Combine all candidates from different modes
  const allCandidates = [...selectedCandidates.value]
  
  // If there's candidate text, parse candidates from text via API
  if (selectedMode.value === CANDIDATE_INPUT_MODE.INPUT && candidateText.value.trim().length > 0) {
    isProcessing.value = true
    try {
      const parsedCandidates = await parseCandidatesFromText(candidateText.value.trim())
      
      // Add parsed candidates if not already in list
      parsedCandidates.forEach(candidate => {
        const isDuplicate = allCandidates.some(c => 
          (c.email && candidate.email && c.email === candidate.email) ||
          (c.firstName === candidate.firstName && 
           c.lastName === candidate.lastName &&
           candidate.firstName !== 'Candidate')
        )
        
        if (!isDuplicate) {
          allCandidates.push(candidate)
        }
      })
    } catch (error) {
      console.error('Error parsing candidates from text:', error)
      // Continue with existing candidates if parsing fails
    } finally {
      isProcessing.value = false
    }
  }
  
  emit('update:candidates', allCandidates)
  emit('next')
}

const openSaveCandidateModal = () => {
  emit('save-candidate')
}

watch(() => props.candidates, (newCandidates) => {
  selectedCandidates.value = [...newCandidates]
}, { immediate: true })
</script>
