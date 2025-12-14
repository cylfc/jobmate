<template>
  <UModal v-model="isOpen">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Save Candidate to Database</h3>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="First Name" name="firstName" required>
              <UInput v-model="form.firstName" placeholder="Enter first name" />
            </UFormField>
            <UFormField label="Last Name" name="lastName" required>
              <UInput v-model="form.lastName" placeholder="Enter last name" />
            </UFormField>
          </div>

          <UFormField label="Email" name="email" required>
            <UInput v-model="form.email" type="email" placeholder="Enter email" />
          </UFormField>

          <UFormField label="Phone" name="phone">
            <UInput v-model="form.phone" placeholder="Enter phone number" />
          </UFormField>

          <UFormField label="Skills" name="skills">
            <UTextarea
              v-model="skillsText"
              placeholder="Enter skills (one per line or comma-separated)"
              :rows="3"
            />
          </UFormField>

          <UFormField label="Experience (years)" name="experience">
            <UInput
              v-model.number="form.experience"
              type="number"
              placeholder="Enter years of experience"
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
              Cancel
            </UButton>
            <UButton
              color="primary"
              :loading="isSaving"
              @click="handleSave"
            >
              Save Candidate
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Candidate, CreateCandidateInput } from '@matching/types/matching'

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

