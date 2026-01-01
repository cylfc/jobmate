<template>
  <UModal v-model:open="modelValue">
    <template #title>
      {{ candidate ? t('candidate.edit.title') : t('candidate.create.title') }}
    </template>

    <template #description>
      <span class="sr-only">{{ candidate ? t('candidate.edit.title') : t('candidate.create.title') }}</span>
    </template>

    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ candidate ? t('candidate.edit.title') : t('candidate.create.title') }}</h3>
        </template>

        <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-4 -mr-4">
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
          <div v-if="selectedMode === CANDIDATE_CREATE_MODE.INPUT" class="space-y-4">
            <UFormField :label="t('candidate.create.input.candidate-information')" name="candidateText" class="w-full">
              <UTextarea
                v-model="candidateText"
                :placeholder="t('candidate.create.input.placeholder')"
                :rows="10"
                class="w-full"
              />
              <template #hint>
                <p class="text-sm text-muted mt-1">
                  {{ t('candidate.create.input.hint') }}
                </p>
              </template>
            </UFormField>
            <UButton
              v-if="candidateText.trim().length > 0"
              color="primary"
              variant="outline"
              icon="i-lucide-sparkles"
              :loading="isExtracting"
              @click="handleExtractFromText"
            >
              {{ t('candidate.create.input.extract-data') }}
            </UButton>
          </div>

          <!-- UPLOAD Mode: Import CV -->
          <div v-else-if="selectedMode === CANDIDATE_CREATE_MODE.UPLOAD" class="space-y-4">
            <UFormField :label="t('candidate.create.upload.label')" name="cvFile" class="w-full">
              <UInput
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                class="w-full"
                @change="handleFileUpload"
              />
              <template #hint>
                <p class="text-sm text-muted mt-1">
                  {{ t('candidate.create.upload.supported-formats') }}
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
              {{ t('candidate.create.upload.extract-data') }}
            </UButton>
          </div>

          <!-- FORM Mode: Manual input (existing form) -->
          <div v-else-if="selectedMode === CANDIDATE_CREATE_MODE.FORM" class="space-y-4">
            <UForm
              :schema="schema"
              :state="form"
              class="space-y-4"
              @submit="handleSubmit"
            >
              <div class="grid grid-cols-2 gap-4">
                <UFormField :label="t('auth.first-name')" name="firstName" required class="w-full">
                  <UInput
                    v-model="form.firstName"
                    :placeholder="t('auth.register-form.first-name-placeholder')"
                    class="w-full"
                  />
                </UFormField>
                <UFormField :label="t('auth.last-name')" name="lastName" required class="w-full">
                  <UInput
                    v-model="form.lastName"
                    :placeholder="t('auth.register-form.last-name-placeholder')"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <UFormField :label="t('auth.email')" name="email" required class="w-full">
                <UInput
                  v-model="form.email"
                  type="email"
                  :placeholder="t('auth.login-form.email-placeholder')"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('candidate.create.phone')" name="phone" class="w-full">
                <UInput
                  v-model="form.phone"
                  :placeholder="t('candidate.create.phone-placeholder')"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('candidate.create.experience')" name="experience" class="w-full">
                <UInput
                  v-model="form.experience"
                  type="number"
                  :placeholder="t('candidate.create.experience-placeholder')"
                  :min="0"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('candidate.current-company')" name="currentCompany" class="w-full">
                <UInput
                  v-model="form.currentCompany"
                  :placeholder="t('candidate.create.current-company-placeholder')"
                  class="w-full"
                />
              </UFormField>

              <!-- Current Salary -->
              <div class="grid grid-cols-3 gap-4">
                <UFormField :label="t('candidate.create.current-salary')" name="currentSalaryAmount" class="w-full col-span-2">
                  <UInput
                    v-model.number="currentSalaryAmount"
                    type="number"
                    :placeholder="t('candidate.create.current-salary-placeholder')"
                    class="w-full"
                  />
                </UFormField>
                <UFormField :label="t('candidate.create.currency')" name="currentSalaryCurrency" class="w-full">
                  <USelectMenu
                    v-model="currentSalaryCurrency"
                    :items="currencyOptions"
                    value-key="value"
                    :placeholder="t('candidate.create.currency-placeholder')"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <!-- Expected Salary -->
              <div class="grid grid-cols-3 gap-4">
                <UFormField :label="t('candidate.create.expected-salary-min')" name="expectedSalaryMin" class="w-full">
                  <UInput
                    v-model.number="expectedSalaryMin"
                    type="number"
                    :placeholder="t('candidate.create.expected-salary-min-placeholder')"
                    class="w-full"
                  />
                </UFormField>
                <UFormField :label="t('candidate.create.expected-salary-max')" name="expectedSalaryMax" class="w-full">
                  <UInput
                    v-model.number="expectedSalaryMax"
                    type="number"
                    :placeholder="t('candidate.create.expected-salary-max-placeholder')"
                    class="w-full"
                  />
                </UFormField>
                <UFormField :label="t('candidate.create.currency')" name="expectedSalaryCurrency" class="w-full">
                  <USelectMenu
                    v-model="expectedSalaryCurrency"
                    :items="currencyOptions"
                    value-key="value"
                    :placeholder="t('candidate.create.currency-placeholder')"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <USeparator class="my-4" />

              <!-- Education Section -->
              <EducationForm :model-value="form.educations || []" @update:model-value="form.educations = $event" />

              <USeparator class="my-4" />

              <!-- Skills Detailed Section -->
              <SkillsForm :model-value="form.skillsDetailed || []" @update:model-value="form.skillsDetailed = $event" />

              <USeparator class="my-4" />

              <!-- Work Experience Section -->
              <WorkExperienceForm :model-value="form.workExperiences || []" @update:model-value="form.workExperiences = $event" />

              <USeparator class="my-4" />

              <!-- Projects Section -->
              <ProjectsForm :model-value="form.projects || []" @update:model-value="form.projects = $event" />
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
              {{ candidate ? t('candidate.edit.submit-button') : t('candidate.create.submit-button') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { Candidate, CreateCandidateInput } from '@candidate/types/candidate'
import { CANDIDATE_CREATE_MODE, type CandidateCreateMode } from '@candidate/constants/modes'
import { useCandidate } from '@candidate/utils/candidate-api'
import EducationForm from '../forms/education-form.vue'
import SkillsForm from '../forms/skills-form.vue'
import WorkExperienceForm from '../forms/work-experience-form.vue'
import ProjectsForm from '../forms/projects-form.vue'

interface Props {
  candidate?: Candidate | null
}

interface Emits {
  (e: 'submit', value: CreateCandidateInput): void
}

const props = withDefaults(defineProps<Props>(), {
  candidate: null,
})

const modelValue = defineModel<boolean>({ default: false })
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { parseCandidateFromText } = useCandidate()

const STORAGE_KEY = 'candidate-form-draft'

const selectedMode = ref<CandidateCreateMode>(CANDIDATE_CREATE_MODE.FORM)
const isSaving = ref(false)
const isExtracting = ref(false)
const candidateText = ref('')
const uploadedFile = ref<File | null>(null)

// Salary fields
const currentSalaryAmount = ref<number | undefined>(undefined)
const currentSalaryCurrency = ref<string>('USD')
const expectedSalaryMin = ref<number | undefined>(undefined)
const expectedSalaryMax = ref<number | undefined>(undefined)
const expectedSalaryCurrency = ref<string>('USD')

const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'VND', value: 'VND' },
  { label: 'GBP', value: 'GBP' },
  { label: 'JPY', value: 'JPY' },
]

const form = ref<CreateCandidateInput>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  experience: undefined,
  currentCompany: '',
  educations: [],
  skillsDetailed: [],
  workExperiences: [],
  projects: [],
})

// Storage functions
const saveFormToStorage = () => {
  if (props.candidate) return // Don't save in edit mode
  
  try {
    const formData = {
      form: form.value,
      currentSalaryAmount: currentSalaryAmount.value,
      currentSalaryCurrency: currentSalaryCurrency.value,
      expectedSalaryMin: expectedSalaryMin.value,
      expectedSalaryMax: expectedSalaryMax.value,
      expectedSalaryCurrency: expectedSalaryCurrency.value,
      selectedMode: selectedMode.value,
      candidateText: candidateText.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
  } catch (error) {
    console.error('Error saving form to storage:', error)
  }
}

const loadFormFromStorage = () => {
  if (props.candidate) return // Don't load in edit mode
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const formData = JSON.parse(stored)
      if (formData.form) {
        form.value = formData.form
      }
      if (formData.currentSalaryAmount !== undefined) {
        currentSalaryAmount.value = formData.currentSalaryAmount
      }
      if (formData.currentSalaryCurrency !== undefined) {
        currentSalaryCurrency.value = formData.currentSalaryCurrency
      }
      if (formData.expectedSalaryMin !== undefined) {
        expectedSalaryMin.value = formData.expectedSalaryMin
      }
      if (formData.expectedSalaryMax !== undefined) {
        expectedSalaryMax.value = formData.expectedSalaryMax
      }
      if (formData.expectedSalaryCurrency !== undefined) {
        expectedSalaryCurrency.value = formData.expectedSalaryCurrency
      }
      if (formData.selectedMode !== undefined) {
        selectedMode.value = formData.selectedMode
      }
      if (formData.candidateText !== undefined) {
        candidateText.value = formData.candidateText
      }
    }
  } catch (error) {
    console.error('Error loading form from storage:', error)
  }
}

const clearFormStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing form storage:', error)
  }
}

// Watch for candidate prop changes to populate form for edit mode
watch(() => props.candidate, (newCandidate) => {
  if (newCandidate) {
    form.value = {
      firstName: newCandidate.firstName,
      lastName: newCandidate.lastName,
      email: newCandidate.email,
      phone: newCandidate.phone || '',
      experience: newCandidate.experience !== undefined && newCandidate.experience !== null ? Number(newCandidate.experience) : undefined,
      currentCompany: newCandidate.currentCompany || '',
      currentSalary: newCandidate.currentSalary,
      expectedSalary: newCandidate.expectedSalary,
      educations: newCandidate.educations || [],
      skillsDetailed: newCandidate.skillsDetailed || [],
      workExperiences: newCandidate.workExperiences || [],
      projects: newCandidate.projects || [],
    }
    if (newCandidate.currentSalary) {
      currentSalaryAmount.value = newCandidate.currentSalary.amount
      currentSalaryCurrency.value = newCandidate.currentSalary.currency
    }
    if (newCandidate.expectedSalary) {
      expectedSalaryMin.value = newCandidate.expectedSalary.min
      expectedSalaryMax.value = newCandidate.expectedSalary.max
      expectedSalaryCurrency.value = newCandidate.expectedSalary.currency
    }
    // Set mode to FORM for edit
    selectedMode.value = CANDIDATE_CREATE_MODE.FORM
    // Clear storage when editing
    clearFormStorage()
  } else {
    // Load from storage when creating new candidate
    loadFormFromStorage()
  }
}, { immediate: true })

// Watch for modal open to load from storage
watch(() => modelValue.value, (isOpen) => {
  if (isOpen && !props.candidate) {
    // Load from storage when modal opens in create mode
    loadFormFromStorage()
  }
})

// Watch form changes and save to storage (debounced)
let saveTimeout: ReturnType<typeof setTimeout> | null = null
watch([form, currentSalaryAmount, currentSalaryCurrency, expectedSalaryMin, expectedSalaryMax, expectedSalaryCurrency, selectedMode, candidateText], () => {
  if (props.candidate) return // Don't save in edit mode
  
  // Debounce saves to avoid too many writes
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    saveFormToStorage()
  }, 500)
}, { deep: true })

const tabs = computed(() => [
  { label: t('candidate.create.mode.input'), value: CANDIDATE_CREATE_MODE.INPUT, icon: 'i-lucide-pencil' },
  { label: t('candidate.create.mode.upload'), value: CANDIDATE_CREATE_MODE.UPLOAD, icon: 'i-lucide-file-up' },
  { label: t('candidate.create.mode.form'), value: CANDIDATE_CREATE_MODE.FORM, icon: 'i-lucide-file-edit' },
])

const canSubmit = computed(() => {
  if (selectedMode.value === CANDIDATE_CREATE_MODE.INPUT) {
    return form.value.firstName && form.value.lastName && form.value.email
  }
  if (selectedMode.value === CANDIDATE_CREATE_MODE.UPLOAD) {
    return form.value.firstName && form.value.lastName && form.value.email
  }
  if (selectedMode.value === CANDIDATE_CREATE_MODE.FORM) {
    return form.value.firstName && form.value.lastName && form.value.email
  }
  return false
})

const schema = computed(() => z.object({
  firstName: z
    .string({ required_error: t('auth.validation.first-name-required') })
    .min(2, t('auth.validation.first-name-min')),
  lastName: z
    .string({ required_error: t('auth.validation.last-name-required') })
    .min(2, t('auth.validation.last-name-min')),
  email: z
    .string({ required_error: t('auth.validation.email-required') })
    .email(t('auth.validation.email-invalid')),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.number().optional(),
  currentSalary: z.object({
    amount: z.number().optional(),
    currency: z.string().optional(),
  }).optional(),
  expectedSalary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().optional(),
  }).optional(),
}))

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadedFile.value = target.files[0]
  }
}

const handleExtractFromText = async () => {
  if (!candidateText.value.trim()) return

  isExtracting.value = true
  try {
    const parsedCandidate = await parseCandidateFromText(candidateText.value.trim())
    if (parsedCandidate) {
      form.value = {
        firstName: parsedCandidate.firstName || '',
        lastName: parsedCandidate.lastName || '',
        email: parsedCandidate.email || '',
        phone: parsedCandidate.phone || '',
        experience: parsedCandidate.experience !== undefined && parsedCandidate.experience !== null ? Number(parsedCandidate.experience) : undefined,
        currentSalary: parsedCandidate.currentSalary,
        expectedSalary: parsedCandidate.expectedSalary,
        educations: [],
        skillsDetailed: [],
        workExperiences: [],
        projects: [],
      }
      if (parsedCandidate.currentSalary) {
        currentSalaryAmount.value = parsedCandidate.currentSalary.amount
        currentSalaryCurrency.value = parsedCandidate.currentSalary.currency
      }
      if (parsedCandidate.expectedSalary) {
        expectedSalaryMin.value = parsedCandidate.expectedSalary.min
        expectedSalaryMax.value = parsedCandidate.expectedSalary.max
        expectedSalaryCurrency.value = parsedCandidate.expectedSalary.currency
      }
    }
  } catch (error) {
    console.error('Error extracting candidate data:', error)
  } finally {
    isExtracting.value = false
  }
}

const handleExtractFromFile = async () => {
  if (!uploadedFile.value) return

  isExtracting.value = true
  try {
    // Read file content
    const text = await uploadedFile.value.text()
    const parsedCandidate = await parseCandidateFromText(text)
    if (parsedCandidate) {
      form.value = {
        firstName: parsedCandidate.firstName || '',
        lastName: parsedCandidate.lastName || '',
        email: parsedCandidate.email || '',
        phone: parsedCandidate.phone || '',
        experience: parsedCandidate.experience !== undefined && parsedCandidate.experience !== null ? Number(parsedCandidate.experience) : undefined,
        currentSalary: parsedCandidate.currentSalary,
        expectedSalary: parsedCandidate.expectedSalary,
        educations: [],
        skillsDetailed: [],
        workExperiences: [],
        projects: [],
      }
      if (parsedCandidate.currentSalary) {
        currentSalaryAmount.value = parsedCandidate.currentSalary.amount
        currentSalaryCurrency.value = parsedCandidate.currentSalary.currency
      }
      if (parsedCandidate.expectedSalary) {
        expectedSalaryMin.value = parsedCandidate.expectedSalary.min
        expectedSalaryMax.value = parsedCandidate.expectedSalary.max
        expectedSalaryCurrency.value = parsedCandidate.expectedSalary.currency
      }
    }
  } catch (error) {
    console.error('Error extracting candidate data from file:', error)
  } finally {
    isExtracting.value = false
  }
}

const handleSubmit = async () => {
  // Validate form data
  if (!form.value.firstName || !form.value.lastName || !form.value.email) {
    return
  }

  isSaving.value = true

  const candidateData: CreateCandidateInput = {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    email: form.value.email,
    phone: form.value.phone || undefined,
    experience: form.value.experience !== undefined && form.value.experience !== null && !isNaN(Number(form.value.experience)) ? Number(form.value.experience) : undefined,
    currentCompany: form.value.currentCompany || undefined,
    currentSalary: currentSalaryAmount.value !== undefined && currentSalaryAmount.value > 0
      ? {
          amount: currentSalaryAmount.value,
          currency: currentSalaryCurrency.value,
        }
      : undefined,
    expectedSalary: expectedSalaryMin.value !== undefined && expectedSalaryMax.value !== undefined
      && expectedSalaryMin.value > 0 && expectedSalaryMax.value > 0
      ? {
          min: expectedSalaryMin.value,
          max: expectedSalaryMax.value,
          currency: expectedSalaryCurrency.value,
        }
      : undefined,
    // Include detailed fields
    educations: form.value.educations || [],
    skillsDetailed: form.value.skillsDetailed || [],
    workExperiences: form.value.workExperiences || [],
    projects: form.value.projects || [],
  }

  try {
    emit('submit', candidateData)
    // Clear storage on successful submit
    clearFormStorage()
    close()
    resetForm()
  } catch (error) {
    console.error('Error creating candidate:', error)
  } finally {
    isSaving.value = false
  }
}

const resetForm = () => {
  if (props.candidate) {
    // Reset to candidate values for edit mode
    form.value = {
      firstName: props.candidate.firstName,
      lastName: props.candidate.lastName,
      email: props.candidate.email,
      phone: props.candidate.phone || '',
      experience: props.candidate.experience || 0,
      currentCompany: props.candidate.currentCompany || '',
      currentSalary: props.candidate.currentSalary,
      expectedSalary: props.candidate.expectedSalary,
      educations: props.candidate.educations || [],
      skillsDetailed: props.candidate.skillsDetailed || [],
      workExperiences: props.candidate.workExperiences || [],
      projects: props.candidate.projects || [],
    }
    if (props.candidate.currentSalary) {
      currentSalaryAmount.value = props.candidate.currentSalary.amount
      currentSalaryCurrency.value = props.candidate.currentSalary.currency
    } else {
      currentSalaryAmount.value = undefined
      currentSalaryCurrency.value = 'USD'
    }
    if (props.candidate.expectedSalary) {
      expectedSalaryMin.value = props.candidate.expectedSalary.min
      expectedSalaryMax.value = props.candidate.expectedSalary.max
      expectedSalaryCurrency.value = props.candidate.expectedSalary.currency
    } else {
      expectedSalaryMin.value = undefined
      expectedSalaryMax.value = undefined
      expectedSalaryCurrency.value = 'USD'
    }
  } else {
    // Reset to empty for create mode
    form.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      experience: undefined,
      currentCompany: '',
      educations: [],
      skillsDetailed: [],
      workExperiences: [],
      projects: [],
    }
    currentSalaryAmount.value = undefined
    currentSalaryCurrency.value = 'USD'
    expectedSalaryMin.value = undefined
    expectedSalaryMax.value = undefined
    expectedSalaryCurrency.value = 'USD'
  }
  candidateText.value = ''
  uploadedFile.value = null
}

const close = () => {
  modelValue.value = false
  // Don't clear storage on close - keep draft for next time
  // Only clear on successful submit
  resetForm()
}
</script>
