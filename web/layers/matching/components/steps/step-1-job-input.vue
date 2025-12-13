<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold mb-2">Step 1: Job Information</h2>
      <p class="text-gray-600">Enter job details or select from your database</p>
    </div>

    <div class="space-y-4">
      <div v-if="selectedMode === 'input'" class="space-y-4">
        <UFormField label="Job Description" name="description" class="w-full">
          <UTextarea
            v-model="jobDescription"
            placeholder="Paste job description here..."
            :rows="10"
            class="w-full"
          />
        </UFormField>
      </div>

      <div v-else-if="selectedMode === 'upload'" class="space-y-4">
        <UFormField label="Upload Job Description File" name="file" class="w-full">
          <UInput
            type="file"
            accept=".pdf,.doc,.docx,.txt"
             class="w-full"
            @change="handleFileUpload"
          />
          <template #hint>
            <p class="text-sm text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, TXT
            </p>
          </template>
        </UFormField>
      </div>

      <div v-else-if="selectedMode === 'link'" class="space-y-4">
        <UFormField label="Job Link" name="link" class="w-full">
          <UInput
            v-model="jobLink"
            placeholder="https://example.com/job/123"
            icon="i-lucide-link"
            class="w-full"
          />
        </UFormField>
      </div>

      <div v-else-if="selectedMode === 'database'" class="space-y-4">
        <UFormField label="Select Job from Database" name="job" class="w-full">
          <USelectMenu
            v-model="selectedJobId"
            :options="jobOptions"
            placeholder="Select a job..."
            searchable
            class="w-full"
          />
        </UFormField>
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

    <div class="flex items-center justify-between pt-4">
      <div class="flex gap-2">
        <UButton
          v-if="canSaveJob"
          color="neutral"
          variant="outline"
          @click="openSaveJobModal"
        >
          Save Job to Database
        </UButton>
      </div>
      <UButton
        color="primary"
        :disabled="!canProceed"
        @click="handleNext"
      >
        Next Step
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Job } from '../../types/matching'

interface Props {
  job: Job | null
}

interface Emits {
  (e: 'update:job', value: Job | null): void
  (e: 'next'): void
  (e: 'save-job'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { getJobsFromDatabase } = useMatching()

const selectedMode = ref<'input' | 'upload' | 'link' | 'database'>('input')
const jobDescription = ref('')
const jobLink = ref('')
const selectedJobId = ref<string | null>(null)
const uploadedFile = ref<File | null>(null)
const jobsFromDatabase = ref<Job[]>([])

const tabs = [
  { label: 'Input', value: 'input' as const, icon: 'i-lucide-pencil' },
  { label: 'Upload', value: 'upload' as const, icon: 'i-lucide-file-up' },
  { label: 'Link', value: 'link' as const, icon: 'i-lucide-link' },
  { label: 'Database', value: 'database' as const, icon: 'i-lucide-database' },
]

const jobOptions = computed(() => {
  return jobsFromDatabase.value.map(job => ({
    label: job.title,
    value: job.id || '',
  }))
})

const canProceed = computed(() => {
  if (selectedMode.value === 'input') return jobDescription.value.trim().length > 0
  if (selectedMode.value === 'upload') return uploadedFile.value !== null
  if (selectedMode.value === 'link') return jobLink.value.trim().length > 0
  if (selectedMode.value === 'database') return selectedJobId.value !== null
  return false
})

const canSaveJob = computed(() => {
  return jobDescription.value.trim().length > 0 || uploadedFile.value !== null || jobLink.value.trim().length > 0
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadedFile.value = target.files[0]
  }
}

const handleNext = () => {
  const job: Job = {
    title: '',
    description: jobDescription.value,
    link: jobLink.value || undefined,
    file: uploadedFile.value || undefined,
    status: 'draft',
  }

  if (selectedMode.value === 'database' && selectedJobId.value) {
    const selectedJob = jobsFromDatabase.value.find(j => j.id === selectedJobId.value)
    if (selectedJob) {
      emit('update:job', selectedJob)
      emit('next')
      return
    }
  }

  emit('update:job', job)
  emit('next')
}

const openSaveJobModal = () => {
  emit('save-job')
}

onMounted(async () => {
  jobsFromDatabase.value = await getJobsFromDatabase()
})
</script>

