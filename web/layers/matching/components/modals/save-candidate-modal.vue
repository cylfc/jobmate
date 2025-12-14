<template>
  <UModal v-model="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ t('matching.save-candidate-modal.title') }}</h3>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormField :label="t('matching.save-candidate-modal.first-name')" name="firstName" required>
              <UInput v-model="form.firstName" :placeholder="t('matching.save-candidate-modal.first-name-placeholder')" />
            </UFormField>
            <UFormField :label="t('matching.save-candidate-modal.last-name')" name="lastName" required>
              <UInput v-model="form.lastName" :placeholder="t('matching.save-candidate-modal.last-name-placeholder')" />
            </UFormField>
          </div>

          <UFormField :label="t('matching.save-candidate-modal.email')" name="email" required>
            <UInput v-model="form.email" type="email" :placeholder="t('matching.save-candidate-modal.email-placeholder')" />
          </UFormField>

          <UFormField :label="t('matching.save-candidate-modal.phone')" name="phone">
            <UInput v-model="form.phone" :placeholder="t('matching.save-candidate-modal.phone-placeholder')" />
          </UFormField>

          <UFormField :label="t('matching.save-candidate-modal.skills')" name="skills">
            <UTextarea
              v-model="skillsText"
              :placeholder="t('matching.save-candidate-modal.skills-placeholder')"
              :rows="3"
            />
          </UFormField>

          <UFormField :label="t('matching.save-candidate-modal.experience')" name="experience">
            <UInput
              v-model.number="form.experience"
              type="number"
              :placeholder="t('matching.save-candidate-modal.experience-placeholder')"
            />
          </UFormField>
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
              {{ t('matching.save-candidate-modal.save-candidate') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Candidate, CreateCandidateInput } from '@matching/types/matching'

const { t } = useI18n()

interface Props {
  modelValue: boolean
  candidate?: Candidate | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', value: CreateCandidateInput): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { saveCandidate } = useMatching()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const isSaving = ref(false)
const skillsText = ref('')

const form = ref<CreateCandidateInput>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  skills: [],
  experience: 0,
})

watch(() => props.candidate, (candidate) => {
  if (candidate) {
    form.value = {
      firstName: candidate.firstName || '',
      lastName: candidate.lastName || '',
      email: candidate.email || '',
      phone: candidate.phone || '',
      skills: candidate.skills || [],
      experience: candidate.experience || 0,
    }
    skillsText.value = candidate.skills?.join(', ') || ''
  }
}, { immediate: true })

const handleSave = async () => {
  if (!form.value.firstName || !form.value.lastName || !form.value.email) {
    return
  }

  isSaving.value = true

  const candidateData: CreateCandidateInput = {
    ...form.value,
    skills: skillsText.value
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0),
  }

  try {
    await saveCandidate(candidateData)
    emit('save', candidateData)
    close()
  } catch (error) {
    console.error('Error saving candidate:', error)
  } finally {
    isSaving.value = false
  }
}

const close = () => {
  isOpen.value = false
}
</script>

