<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('matching.save-job-modal.title') }}</h3>
        </template>

        <div class="space-y-4">
          <UFormField :label="t('matching.save-job-modal.job-title')" name="title" required>
            <UInput v-model="form.title" :placeholder="t('matching.save-job-modal.job-title-placeholder')" />
          </UFormField>

          <UFormField :label="t('matching.save-job-modal.company')" name="company">
            <UInput v-model="form.company" :placeholder="t('matching.save-job-modal.company-placeholder')" />
          </UFormField>

          <UFormField :label="t('matching.save-job-modal.domain')" name="domain">
            <UInput v-model="form.domain" :placeholder="t('matching.save-job-modal.domain-placeholder')" />
          </UFormField>

          <UFormField :label="t('matching.save-job-modal.location')" name="location">
            <UInput v-model="form.location" :placeholder="t('matching.save-job-modal.location-placeholder')" />
          </UFormField>

          <UFormField :label="t('matching.save-job-modal.description')" name="description" required>
            <UTextarea
              v-model="form.description"
              :placeholder="t('matching.save-job-modal.description-placeholder')"
              :rows="5"
            />
          </UFormField>

          <UFormField :label="t('matching.save-job-modal.requirements')" name="requirements">
            <UTextarea
              v-model="requirementsText"
              :placeholder="t('matching.save-job-modal.requirements-placeholder')"
              :rows="3"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField :label="t('matching.save-job-modal.min-salary')" name="minSalary">
              <UInput
                v-model.number="minSalary"
                type="number"
                :placeholder="t('matching.save-job-modal.min-salary-placeholder')"
              />
            </UFormField>
            <UFormField :label="t('matching.save-job-modal.max-salary')" name="maxSalary">
              <UInput
                v-model.number="maxSalary"
                type="number"
                :placeholder="t('matching.save-job-modal.max-salary-placeholder')"
              />
            </UFormField>
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
              @click="handleSave"
            >
              {{ t('matching.save-job-modal.save-job') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Job, CreateJobInput } from '@matching/types/matching'

const { t } = useI18n()

interface Props {
  job?: Job | null
}

interface Emits {
  (e: 'save', value: CreateJobInput): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

import { useMatchingJob } from '@matching/composables/use-matching-job'

const { saveJob } = useMatchingJob()

const isOpen = defineModel<boolean>({ default: false })

const isSaving = ref(false)
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
  salary: {
    min: 0,
    max: 0,
    currency: 'USD',
  },
})

watch(() => props.job, (job) => {
  if (job) {
    form.value = {
      title: job.title || '',
      description: job.description || '',
      company: job.company || '',
      domain: job.domain || '',
      location: job.location || '',
      requirements: job.requirements || [],
      salary: job.salary || {
        min: 0,
        max: 0,
        currency: 'USD',
      },
    }
    requirementsText.value = job.requirements?.join('\n') || ''
    minSalary.value = job.salary?.min || 0
    maxSalary.value = job.salary?.max || 0
  } else {
    // Reset form when no job is provided
    form.value = {
      title: '',
      description: '',
      company: '',
      domain: '',
      location: '',
      requirements: [],
      salary: {
        min: 0,
        max: 0,
        currency: 'USD',
      },
    }
    requirementsText.value = ''
    minSalary.value = 0
    maxSalary.value = 0
  }
}, { immediate: true })

watch([minSalary, maxSalary], () => {
  if (!form.value.salary) {
    form.value.salary = {
      min: 0,
      max: 0,
      currency: 'USD',
    }
  }
  form.value.salary.min = minSalary.value
  form.value.salary.max = maxSalary.value
})

const handleSave = async () => {
  if (!form.value.title || !form.value.description) {
    return
  }

  isSaving.value = true

  const jobData: CreateJobInput = {
    ...form.value,
    requirements: requirementsText.value
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0),
  }

  try {
    await saveJob(jobData)
    emit('save', jobData)
    close()
  } catch (error) {
    console.error('Error saving job:', error)
  } finally {
    isSaving.value = false
  }
}

const close = () => {
  isOpen.value = false
}
</script>

