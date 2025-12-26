<template>
  <div class="space-y-4 p-4 border rounded-lg bg-muted/50">
    <h4 class="font-semibold text-lg">{{ t('chat.create-candidate.form.title', { defaultValue: 'Thông tin ứng viên' }) }}</h4>
    
    <UForm
      :schema="schema"
      :state="formData"
      class="space-y-4"
      @submit="handleSubmit"
    >
      <div class="grid grid-cols-2 gap-4">
        <UFormField :label="t('auth.first-name')" name="firstName" required>
          <UInput
            v-model="formData.firstName"
            :placeholder="t('auth.register-form.first-name-placeholder')"
          />
        </UFormField>
        <UFormField :label="t('auth.last-name')" name="lastName" required>
          <UInput
            v-model="formData.lastName"
            :placeholder="t('auth.register-form.last-name-placeholder')"
          />
        </UFormField>
      </div>

      <UFormField :label="t('auth.email')" name="email" required>
        <UInput
          v-model="formData.email"
          type="email"
          :placeholder="t('auth.login-form.email-placeholder')"
        />
      </UFormField>

      <UFormField :label="t('candidate.create.phone')" name="phone">
        <UInput
          v-model="formData.phone"
          :placeholder="t('candidate.create.phone-placeholder')"
        />
      </UFormField>

      <UFormField :label="t('candidate.create.skills')" name="skills">
        <UTextarea
          v-model="skillsText"
          :placeholder="t('candidate.create.skills-placeholder')"
          :rows="3"
        />
      </UFormField>

      <div class="grid grid-cols-2 gap-4">
        <UFormField :label="t('candidate.create.experience')" name="experience">
          <UInput
            v-model.number="formData.experience"
            type="number"
            :placeholder="t('candidate.create.experience-placeholder')"
          />
        </UFormField>
        <UFormField :label="t('candidate.create.current-company')" name="currentCompany">
          <UInput
            v-model="formData.currentCompany"
            :placeholder="t('candidate.create.current-company-placeholder')"
          />
        </UFormField>
      </div>

      <div v-if="formData.expectedSalary" class="grid grid-cols-3 gap-4">
        <UFormField :label="t('candidate.create.salary-min')" name="expectedSalary.min">
          <UInput
            v-model.number="formData.expectedSalary.min"
            type="number"
          />
        </UFormField>
        <UFormField :label="t('candidate.create.salary-max')" name="expectedSalary.max">
          <UInput
            v-model.number="formData.expectedSalary.max"
            type="number"
          />
        </UFormField>
        <UFormField :label="t('candidate.create.salary-currency')" name="expectedSalary.currency">
          <UInput
            v-model="formData.expectedSalary.currency"
            placeholder="USD"
          />
        </UFormField>
      </div>
    </UForm>

    <div class="flex justify-end gap-2 pt-4 border-t">
      <UButton
        color="neutral"
        variant="outline"
        @click="handleCancel"
      >
        {{ t('common.cancel', { defaultValue: 'Hủy' }) }}
      </UButton>
      <UButton
        color="primary"
        :loading="isSaving"
        :disabled="!canSubmit"
        @click="handleSubmit"
      >
        {{ t('common.save', { defaultValue: 'Lưu' }) }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { CreateCandidateInput } from '@candidate/types/candidate'

interface Props {
  candidate?: CreateCandidateInput | null
  isSaving?: boolean
}

interface Emits {
  (e: 'update', data: { action: 'submit' | 'cancel'; candidate?: CreateCandidateInput }): void
}

const props = withDefaults(defineProps<Props>(), {
  candidate: null,
  isSaving: false,
})

const emit = defineEmits<Emits>()

const { t } = useI18n()

const formData = ref<CreateCandidateInput>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  skills: [],
  experience: 0,
  currentCompany: '',
  expectedSalary: undefined,
})

const skillsText = ref('')

// Watch for candidate prop changes
watch(() => props.candidate, (newCandidate) => {
  if (newCandidate) {
    formData.value = {
      firstName: newCandidate.firstName || '',
      lastName: newCandidate.lastName || '',
      email: newCandidate.email || '',
      phone: newCandidate.phone || '',
      skills: newCandidate.skills || [],
      experience: newCandidate.experience || 0,
      currentCompany: newCandidate.currentCompany || '',
      expectedSalary: newCandidate.expectedSalary,
    }
    skillsText.value = newCandidate.skills?.join(', ') || ''
  }
}, { immediate: true })

const schema = computed(() => z.object({
  firstName: z
    .string()
    .min(1, t('auth.validation.first-name-min')),
  lastName: z
    .string()
    .min(1, t('auth.validation.last-name-min')),
  email: z
    .string()
    .email(t('auth.validation.email-invalid')),
  phone: z.string().optional(),
  skills: z.array(z.string()).optional(),
}))

const canSubmit = computed(() => {
  return !!(formData.value.firstName && formData.value.lastName && formData.value.email)
})

const handleSubmit = () => {
  if (!canSubmit.value) return

  const candidateData: CreateCandidateInput = {
    ...formData.value,
    skills: skillsText.value
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  }

  // Emit in format expected by chat handler
  emit('update', {
    action: 'submit',
    candidate: candidateData,
  })
}

const handleCancel = () => {
  // Emit in format expected by chat handler
  emit('update', {
    action: 'cancel',
  })
}
</script>

