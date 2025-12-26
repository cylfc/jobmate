<template>
  <UModal v-model:open="modelValue">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('candidate.create.title') }}</h3>
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

              <UFormField :label="t('candidate.create.skills')" name="skills" class="w-full">
                <UTextarea
                  v-model="skillsText"
                  :placeholder="t('candidate.create.skills-placeholder')"
                  :rows="3"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('candidate.create.experience')" name="experience" class="w-full">
                <UInput
                  v-model.number="form.experience"
                  type="number"
                  :placeholder="t('candidate.create.experience-placeholder')"
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
              {{ t('candidate.create.submit-button') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { CreateCandidateInput } from '@candidate/types/candidate'
import { CANDIDATE_CREATE_MODE, type CandidateCreateMode } from '@candidate/constants/modes'
import { useCandidate } from '@candidate/utils/candidate-api'

interface Emits {
  (e: 'submit', value: CreateCandidateInput): void
}

const modelValue = defineModel<boolean>({ default: false })
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { parseCandidateFromText } = useCandidate()

const selectedMode = ref<CandidateCreateMode>(CANDIDATE_CREATE_MODE.FORM)
const isSaving = ref(false)
const isExtracting = ref(false)
const skillsText = ref('')
const candidateText = ref('')
const uploadedFile = ref<File | null>(null)

const form = ref<CreateCandidateInput>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  skills: [],
  experience: 0,
})

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
        skills: parsedCandidate.skills || [],
        experience: parsedCandidate.experience || 0,
      }
      skillsText.value = parsedCandidate.skills?.join(', ') || ''
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
        skills: parsedCandidate.skills || [],
        experience: parsedCandidate.experience || 0,
      }
      skillsText.value = parsedCandidate.skills?.join(', ') || ''
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
    ...form.value,
    skills: skillsText.value
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  }

  try {
    emit('submit', candidateData)
    close()
    resetForm()
  } catch (error) {
    console.error('Error creating candidate:', error)
  } finally {
    isSaving.value = false
  }
}

const resetForm = () => {
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    skills: [],
    experience: 0,
  }
  skillsText.value = ''
  candidateText.value = ''
  uploadedFile.value = null
}

const close = () => {
  modelValue.value = false
  resetForm()
}
</script>
