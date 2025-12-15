<template>
  <UCard>
    <template #header>
      <div class="text-center">
        <h1 class="text-2xl font-bold text-gray-900">{{ t('auth.forgot-password-form.title') }}</h1>
        <p class="mt-2 text-sm text-gray-600">
          {{ t('auth.forgot-password-form.subtitle') }}
        </p>
      </div>
    </template>

    <div v-if="isEmailSent" class="text-center py-8">
      <UIcon name="i-lucide-mail-check" class="w-16 h-16 text-primary-600 mx-auto mb-4" />
      <h2 class="text-lg font-semibold text-gray-900 mb-2">{{ t('auth.forgot-password-form.email-sent-title') }}</h2>
      <p class="text-sm text-gray-600 mb-6">
        {{ t('auth.forgot-password-form.email-sent-message') }}
      </p>
      <UButton
        to="/auth/login"
        color="primary"
        size="lg"
      >
        {{ t('auth.forgot-password-form.back-to-login') }}
      </UButton>
    </div>

    <UForm
      v-else
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="handleSubmit"
    >
      <UFormField :label="t('auth.email')" name="email" required class="w-full">
        <UInput
          v-model="state.email"
          type="email"
          :placeholder="t('auth.forgot-password-form.email-placeholder')"
          autocomplete="email"
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
        {{ t('auth.forgot-password-form.submit-button') }}
      </UButton>
    </UForm>

    <template #footer>
      <div class="text-center text-sm text-gray-600">
        <NuxtLink
          to="/auth/login"
          class="font-medium text-primary-600 hover:text-primary-700"
        >
          {{ t('auth.forgot-password-form.back-to-login') }}
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { useForgotPassword } from '@auth/composables/auth/use-forgot-password'

const { t } = useI18n()
const { schema, state, isLoading, isEmailSent, handleSubmit } = useForgotPassword()
</script>

