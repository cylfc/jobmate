<template>
  <UCard>
    <template #header>
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900">{{ t('auth.change-password-form.title') }}</h1>
        <p class="mt-2 text-sm text-gray-600">
          {{ t('auth.change-password-form.subtitle') }}
        </p>
      </div>
    </template>

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="handleSubmit"
    >
      <UFormField :label="t('auth.current-password')" name="currentPassword" required class="w-full">
        <UInput
          v-model="state.currentPassword"
          type="password"
          :placeholder="t('auth.change-password-form.current-password-placeholder')"
          autocomplete="current-password"
          size="lg"
           class="w-full"
        />
      </UFormField>

      <UFormField :label="t('auth.new-password')" name="newPassword" required class="w-full">
        <UInput
          v-model="state.newPassword"
          type="password"
          :placeholder="t('auth.change-password-form.new-password-placeholder')"
          autocomplete="new-password"
          size="lg"
           class="w-full"
        />
        <template #hint>
          {{ t('auth.change-password-form.password-hint') }}
        </template>
      </UFormField>

      <UFormField :label="t('auth.confirm-new-password')" name="confirmPassword" required class="w-full">
        <UInput
          v-model="state.confirmPassword"
          type="password"
          :placeholder="t('auth.change-password-form.confirm-password-placeholder')"
          autocomplete="new-password"   
          size="lg"
           class="w-full"
        />
      </UFormField>

      <UButton
        type="submit"
        color="primary"
        size="lg"
        block
        :loading="isLoading"
      >
        {{ t('auth.change-password-form.submit-button') }}
      </UButton>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { useChangePassword } from '@auth/composables/auth/use-change-password'

const { t } = useI18n()
const { schema, state, isLoading, handleSubmit } = useChangePassword()
</script>

