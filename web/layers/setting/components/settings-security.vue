<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">
            {{ t('setting.security.title') }}
          </h2>
          <p class="mt-1 text-xs text-muted">
            {{ t('setting.security.subtitle') }}
          </p>
        </div>
      </div>
    </template>

    <UForm
      :schema="schema"
      :state="form"
      class="space-y-4"
      @submit="handleSubmit"
    >
      <UFormField :label="t('auth.current-password')" name="currentPassword" required class="w-full">
        <UInput
          v-model="form.currentPassword"
          type="password"
          :placeholder="t('auth.change-password-form.current-password-placeholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('auth.new-password')" name="newPassword" required class="w-full">
        <UInput
          v-model="form.newPassword"
          type="password"
          :placeholder="t('auth.change-password-form.new-password-placeholder')"
          class="w-full"
        />
        <template #hint>
          <p class="text-sm text-muted mt-1">
            {{ t('auth.change-password-form.password-hint') }}
          </p>
        </template>
      </UFormField>

      <UFormField :label="t('auth.confirm-new-password')" name="confirmPassword" required class="w-full">
        <UInput
          v-model="form.confirmPassword"
          type="password"
          :placeholder="t('auth.change-password-form.confirm-password-placeholder')"
          class="w-full"
        />
      </UFormField>

      <div class="flex justify-end gap-2 pt-4">
        <UButton
          color="neutral"
          variant="ghost"
          @click="handleReset"
        >
          {{ t('common.cancel') }}
        </UButton>
        <UButton
          type="submit"
          color="primary"
          :loading="isSaving"
        >
          {{ t('setting.security.save-button') }}
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { z } from 'zod'

const { t } = useI18n()
const toast = useToast()

interface SecurityForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const form = ref<SecurityForm>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isSaving = ref(false)

const schema = computed(() => z.object({
  currentPassword: z
    .string({ required_error: t('auth.validation.password-required') })
    .min(1, t('auth.validation.password-required')),
  newPassword: z
    .string({ required_error: t('auth.validation.password-required') })
    .min(8, t('auth.validation.password-min', { min: 8 }))
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, t('auth.validation.password-pattern')),
  confirmPassword: z
    .string({ required_error: t('auth.validation.confirm-password-required') })
    .min(1, t('auth.validation.confirm-password-required')),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: t('auth.validation.confirm-password-mismatch'),
  path: ['confirmPassword'],
}))

const handleSubmit = async () => {
  isSaving.value = true
  try {
    // TODO: Call API to change password
    // await $fetch('/api/settings/security/change-password', {
    //   method: 'POST',
    //   body: {
    //     currentPassword: form.value.currentPassword,
    //     newPassword: form.value.newPassword,
    //   },
    // })
    
    toast.add({
      title: t('setting.security.success.title'),
      description: t('setting.security.success.description'),
      color: 'success',
    })
    
    // Reset form after success
    handleReset()
  } catch (_error) {
    toast.add({
      title: t('setting.security.error.title'),
      description: t('setting.security.error.description'),
      color: 'error',
    })
  } finally {
    isSaving.value = false
  }
}

const handleReset = () => {
  form.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}
</script>

