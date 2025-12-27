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
      @submit="handleFormSubmit"
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
import type { FormSubmitEvent } from '@nuxt/ui'
import { useChangePassword } from '@auth/composables/auth/use-change-password'

const { t } = useI18n()
const toast = useToast()

const {
  schema,
  state: form,
  isLoading: isSaving,
  handleSubmit: changePassword,
} = useChangePassword()

const handleFormSubmit = async (event: FormSubmitEvent<any>) => {
  try {
    await changePassword(event)
    toast.add({
      title: t('setting.security.success.title'),
      description: t('setting.security.success.description'),
      color: 'success',
    })
    
    // Reset form after success (already handled by useChangePassword)
    handleReset()
  } catch (_error) {
    toast.add({
      title: t('setting.security.error.title'),
      description: t('setting.security.error.description'),
      color: 'error',
    })
  }
}

const handleReset = () => {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
}
</script>

