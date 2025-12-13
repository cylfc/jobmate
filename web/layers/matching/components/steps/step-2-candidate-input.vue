<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold mb-2">Step 2: Candidates</h2>
      <p class="text-gray-600">Enter candidate information, upload CVs, or select from your database</p>
    </div>

    <div class="space-y-4">
      <div v-if="selectedMode === 'input'" class="space-y-4">
        <UFormField label="Candidate Information" name="candidateText" class="w-full">
          <UTextarea
            v-model="candidateText"
            placeholder="Paste candidate information or CV text here..."
            :rows="10"
            class="w-full"
          />
          <template #hint>
            <p class="text-sm text-gray-500 mt-1">
              Paste candidate information here. You can paste multiple candidates, each on a new line or separated by blank lines.
            </p>
          </template>
        </UFormField>
      </div>

      <div v-else-if="selectedMode === 'upload'" class="space-y-4">
        <UFormField label="Upload CV Files" name="cvs" class="w-full">
          <UInput
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            class="w-full"
            @change="handleFileUpload"
          />
          <template #hint>
            <p class="text-sm text-gray-500 mt-1">
              You can upload multiple CV files. Supported formats: PDF, DOC, DOCX
            </p>
          </template>
        </UFormField>

        <div v-if="uploadedFiles.length > 0" class="space-y-2">
          <p class="text-sm font-medium">Uploaded Files:</p>
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

      <div v-else-if="selectedMode === 'database'" class="space-y-4">
        <UFormField label="Filter Candidates" name="filters" class="w-full">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Status" name="status" class="w-full">
              <USelectMenu
                v-model="filters.status"
                :options="statusOptions"
                placeholder="Select status..."
                clearable
                class="w-full"
              />
            </UFormField>
            <UFormField label="Min Experience (years)" name="minExperience" class="w-full">
              <UInput
                v-model.number="filters.minExperience"
                type="number"
                placeholder="Min Experience"
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
          Load Candidates
        </UButton>

        <div v-if="candidatesFromDatabase.length > 0" class="space-y-2">
          <p class="text-sm font-medium">Select Candidates:</p>
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
        Selected Candidates: {{ selectedCandidates.length }}
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
        Previous
      </UButton>
      <div class="flex gap-2">
        <UButton
          v-if="canSaveCandidate"
          color="neutral"
          variant="outline"
          icon="i-lucide-save"
          @click="openSaveCandidateModal"
        >
          Save Candidates to Database
        </UButton>
        <UButton
          color="primary"
          :disabled="!canProceed"
          icon="i-lucide-arrow-right"
          @click="handleNext"
        >
          Next Step
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Candidate, CandidateFilter } from '../../types/matching'

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

const { getCandidatesFromDatabase } = useMatching()

const selectedMode = ref<'input' | 'upload' | 'database'>('input')
const uploadedFiles = ref<File[]>([])
const selectedCandidates = ref<Candidate[]>([])
const candidatesFromDatabase = ref<Candidate[]>([])
const filters = ref<CandidateFilter>({})
const candidateText = ref('')

const tabs = [
  { label: 'Input', value: 'input' as const, icon: 'i-lucide-pencil' },
  { label: 'Upload CVs', value: 'upload' as const, icon: 'i-lucide-file-up' },
  { label: 'From Database', value: 'database' as const, icon: 'i-lucide-database' },
]

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
]

const canProceed = computed(() => {
  if (selectedMode.value === 'input') {
    return candidateText.value.trim().length > 0
  }
  if (selectedMode.value === 'upload') return uploadedFiles.value.length > 0
  if (selectedMode.value === 'database') return selectedCandidates.value.length > 0
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
  return candidate.email || 'Unknown'
}

const parseCandidateFromText = (text: string): Candidate => {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  const firstLine = lines[0] || ''
  const nameParts = firstLine.split(/\s+/).filter(p => p.length > 0)
  
  return {
    firstName: nameParts[0] || 'Candidate',
    lastName: nameParts.slice(1).join(' ') || '',
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : undefined,
    skills: [],
    experience: 0,
  }
}

const handleNext = () => {
  // Combine all candidates from different modes
  const allCandidates = [...selectedCandidates.value]
  
  // If there's candidate text, parse candidates from text
  if (selectedMode.value === 'input' && candidateText.value.trim().length > 0) {
    const text = candidateText.value.trim()
    
    // Try to split by double newlines (multiple candidates)
    const candidateBlocks = text.split(/\n\s*\n/).filter(block => block.trim().length > 0)
    
    // If no double newlines, treat entire text as one candidate
    if (candidateBlocks.length === 0) {
      candidateBlocks.push(text)
    }
    
    candidateBlocks.forEach(block => {
      const candidateFromText = parseCandidateFromText(block)
      
      // Only add if not already in list (check by email or name)
      const isDuplicate = allCandidates.some(c => 
        (c.email && candidateFromText.email && c.email === candidateFromText.email) ||
        (c.firstName === candidateFromText.firstName && 
         c.lastName === candidateFromText.lastName &&
         candidateFromText.firstName !== 'Candidate')
      )
      
      if (!isDuplicate) {
        allCandidates.push(candidateFromText)
      }
    })
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
