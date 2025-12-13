<template>
  <UModal v-model="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Save Job to Database</h3>
        </template>

        <div class="space-y-4">
          <UFormField label="Job Title" name="title" required>
            <UInput v-model="form.title" placeholder="Enter job title" />
          </UFormField>

          <UFormField label="Company" name="company">
            <UInput v-model="form.company" placeholder="Enter company name" />
          </UFormField>

          <UFormField label="Domain" name="domain">
            <UInput v-model="form.domain" placeholder="Enter domain" />
          </UFormField>

          <UFormField label="Location" name="location">
            <UInput v-model="form.location" placeholder="Enter location" />
          </UFormField>

          <UFormField label="Description" name="description" required>
            <UTextarea
              v-model="form.description"
              placeholder="Enter job description"
              :rows="5"
            />
          </UFormField>

          <UFormField label="Requirements" name="requirements">
            <UTextarea
              v-model="requirementsText"
              placeholder="Enter requirements (one per line)"
              :rows="3"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Min Salary" name="minSalary">
              <UInput
                v-model.number="minSalary"
                type="number"
                placeholder="Min salary"
              />
            </UFormField>
            <UFormField label="Max Salary" name="maxSalary">
              <UInput
                v-model.number="maxSalary"
                type="number"
                placeholder="Max salary"
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
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="isSaving"
              @click="handleSave"
            >
              Save Job
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Job, CreateJobInput } from '@matching/types/matching'

interface Props {
  modelValue: boolean
  job?: Job | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', value: CreateJobInput): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { saveJob } = useMatching()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

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

