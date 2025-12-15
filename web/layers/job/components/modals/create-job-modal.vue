<template>
  <UModal v-model:open="modelValue">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('job.create.title') }}</h3>
        </template>

        <div class="space-y-4">
          <!-- Mode Selection Buttons -->
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

          <USeparator class="my-4" />

          <!-- INPUT Mode: Text input with AI extraction -->
          <div v-if="selectedMode === JOB_CREATE_MODE.INPUT" class="space-y-4">
            <UFormField :label="t('job.create.input.job-information')" name="jobText" class="w-full">
              <UTextarea
                v-model="jobText"
                :placeholder="t('job.create.input.placeholder')"
                :rows="10"
                class="w-full"
              />
              <template #hint>
                <p class="text-sm text-gray-500 mt-1">
                  {{ t('job.create.input.hint') }}
                </p>
              </template>
            </UFormField>
            <UButton
              v-if="jobText.trim().length > 0"
              color="primary"
              variant="outline"
              icon="i-lucide-sparkles"
              :loading="isExtracting"
              @click="handleExtractFromText"
            >
              {{ t('job.create.input.extract-data') }}
            </UButton>
          </div>

          <!-- UPLOAD Mode: Import JD -->
          <div v-else-if="selectedMode === JOB_CREATE_MODE.UPLOAD" class="space-y-4">
            <UFormField :label="t('job.create.upload.label')" name="jdFile" class="w-full">
              <UInput
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                class="w-full"
                @change="handleFileUpload"
              />
              <template #hint>
                <p class="text-sm text-gray-500 mt-1">
                  {{ t('job.create.upload.supported-formats') }}
                </p>
              </template>
            </UFormField>
            <UButton
              v-if="uploadedFile"
              color="primary"
              variant="outline"
              icon="i-lucide-sparkles"
              :loading="isExtracting"
              @click="handleExtractFromFile"
            >
              {{ t('job.create.upload.extract-data') }}
            </UButton>
          </div>

          <!-- FORM Mode: Manual input -->
          <div v-else-if="selectedMode === JOB_CREATE_MODE.FORM" class="space-y-4">
            <UForm
              :schema="schema"
              :state="form"
              class="space-y-4"
              @submit="handleSubmit"
            >
              <UFormField :label="t('job.create.form.title')" name="title" required class="w-full">
                <UInput
                  v-model="form.title"
                  :placeholder="t('job.create.form.title-placeholder')"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('job.create.form.company')" name="company" required class="w-full">
                <UInput
                  v-model="form.company"
                  :placeholder="t('job.create.form.company-placeholder')"
                  class="w-full"
                />
              </UFormField>

              <div class="grid grid-cols-2 gap-4">
                <UFormField :label="t('job.create.form.domain')" name="domain" class="w-full">
                  <UInput
                    v-model="form.domain"
                    :placeholder="t('job.create.form.domain-placeholder')"
                    class="w-full"
                  />
                </UFormField>
                <UFormField :label="t('job.create.form.location')" name="location" required class="w-full">
                  <UInput
                    v-model="form.location"
                    :placeholder="t('job.create.form.location-placeholder')"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField :label="t('job.create.form.description')" name="description" required class="w-full">
                <UTextarea
                  v-model="form.description"
                  :placeholder="t('job.create.form.description-placeholder')"
                  :rows="5"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('job.create.form.requirements')" name="requirements" class="w-full">
                <UTextarea
                  v-model="requirementsText"
                  :placeholder="t('job.create.form.requirements-placeholder')"
                  :rows="3"
                  class="w-full"
                />
              </UFormField>

              <div class="grid grid-cols-2 gap-4">
                <UFormField :label="t('job.create.form.min-salary')" name="minSalary" class="w-full">
                  <UInput
                    v-model.number="minSalary"
                    type="number"
                    :placeholder="t('job.create.form.min-salary-placeholder')"
                    class="w-full"
                  />
                </UFormField>
                <UFormField :label="t('job.create.form.max-salary')" name="maxSalary" class="w-full">
                  <UInput
                    v-model.number="maxSalary"
                    type="number"
                    :placeholder="t('job.create.form.max-salary-placeholder')"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField :label="t('job.create.form.link')" name="link" class="w-full">
                <UInput
                  v-model="form.link"
                  :placeholder="t('job.create.form.link-placeholder')"
                  class="w-full"
                />
              </UFormField>
            </UForm>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="close"
            >
              {{ t('common.cancel') }}
            </UButton>
            <UButton
              color="primary"
              :loading="isSaving"
              :disabled="!canSubmit"
              @click="handleSubmit"
            >
              {{ t('job.create.submit-button') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { CreateJobInput } from '@job/types/job'
import { JOB_CREATE_MODE, type JobCreateMode } from '@job/constants/modes'

interface Emits {
  (e: 'submit', value: CreateJobInput): void
}

const modelValue = defineModel<boolean>({ default: false })
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { parseJobFromText } = useJob()

const selectedMode = ref<JobCreateMode>(JOB_CREATE_MODE.FORM)
const isSaving = ref(false)
const isExtracting = ref(false)
const jobText = ref('')
const uploadedFile = ref<File | null>(null)
const requirementsText = ref('')
const minSalary = ref(0)
const maxSalary = ref(0)

const form = ref<CreateJobInput>({
  title: '',
  description: '',
  company: '',
  domain: '',
  location: '',
  requirements: [],
  link: '',
})

const tabs = computed(() => [
  { label: t('job.create.mode.input'), value: JOB_CREATE_MODE.INPUT, icon: 'i-lucide-pencil' },
  { label: t('job.create.mode.upload'), value: JOB_CREATE_MODE.UPLOAD, icon: 'i-lucide-file-up' },
  { label: t('job.create.mode.form'), value: JOB_CREATE_MODE.FORM, icon: 'i-lucide-file-edit' },
])

const canSubmit = computed(() => {
  if (selectedMode.value === JOB_CREATE_MODE.INPUT) {
    return form.value.title && form.value.description && form.value.company && form.value.location
  }
  if (selectedMode.value === JOB_CREATE_MODE.UPLOAD) {
    return form.value.title && form.value.description && form.value.company && form.value.location
  }
  if (selectedMode.value === JOB_CREATE_MODE.FORM) {
    return form.value.title && form.value.description && form.value.company && form.value.location
  }
  return false
})

const schema = computed(() => z.object({
  title: z
    .string({ required_error: t('job.validation.title-required') })
    .min(2, t('job.validation.title-min')),
  description: z
    .string({ required_error: t('job.validation.description-required') })
    .min(10, t('job.validation.description-min')),
  company: z
    .string({ required_error: t('job.validation.company-required') })
    .min(2, t('job.validation.company-min')),
  location: z
    .string({ required_error: t('job.validation.location-required') })
    .min(2, t('job.validation.location-min')),
  requirements: z.array(z.string()).optional(),
}))

watch([minSalary, maxSalary], () => {
  if (minSalary.value > 0 || maxSalary.value > 0) {
    form.value.salary = {
      min: minSalary.value,
      max: maxSalary.value,
      currency: 'USD',
    }
  } else {
    form.value.salary = undefined
  }
})

watch(requirementsText, (newVal) => {
  form.value.requirements = newVal.split(/[,\n]/).map(s => s.trim()).filter(s => s.length > 0)
})

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadedFile.value = target.files[0]
  }
}

const handleExtractFromText = async () => {
  if (!jobText.value.trim()) return

  isExtracting.value = true
  try {
    const parsedJob = await parseJobFromText(jobText.value.trim())
    if (parsedJob) {
      form.value = {
        title: parsedJob.title || '',
        description: parsedJob.description || '',
        company: parsedJob.company || '',
        domain: parsedJob.domain || '',
        location: parsedJob.location || '',
        requirements: parsedJob.requirements || [],
        salary: parsedJob.salary,
        link: parsedJob.link || '',
      }
      requirementsText.value = parsedJob.requirements?.join(', ') || ''
      minSalary.value = parsedJob.salary?.min || 0
      maxSalary.value = parsedJob.salary?.max || 0
    }
  } catch (error) {
    console.error('Error extracting job data:', error)
  } finally {
    isExtracting.value = false
  }
}

const handleExtractFromFile = async () => {
  if (!uploadedFile.value) return

  isExtracting.value = true
  try {
    const text = await uploadedFile.value.text()
    const parsedJob = await parseJobFromText(text)
    if (parsedJob) {
      form.value = {
        title: parsedJob.title || '',
        description: parsedJob.description || '',
        company: parsedJob.company || '',
        domain: parsedJob.domain || '',
        location: parsedJob.location || '',
        requirements: parsedJob.requirements || [],
        salary: parsedJob.salary,
        link: parsedJob.link || '',
      }
      requirementsText.value = parsedJob.requirements?.join(', ') || ''
      minSalary.value = parsedJob.salary?.min || 0
      maxSalary.value = parsedJob.salary?.max || 0
    }
  } catch (error) {
    console.error('Error extracting job data from file:', error)
  } finally {
    isExtracting.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.title || !form.value.description || !form.value.company || !form.value.location) {
    return
  }

  isSaving.value = true

  const jobData: CreateJobInput = {
    ...form.value,
    requirements: requirementsText.value
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  }

  try {
    emit('submit', jobData)
    close()
    resetForm()
  } catch (error) {
    console.error('Error creating job:', error)
  } finally {
    isSaving.value = false
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    description: '',
    company: '',
    domain: '',
    location: '',
    requirements: [],
    link: '',
  }
  jobText.value = ''
  uploadedFile.value = null
  requirementsText.value = ''
  minSalary.value = 0
  maxSalary.value = 0
}

const close = () => {
  modelValue.value = false
  resetForm()
}
</script>

