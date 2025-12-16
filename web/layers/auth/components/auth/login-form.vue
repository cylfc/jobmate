<template>
  <UCard>
    <template #header>
      <div class="text-center">
        <h1 class="text-2xl font-bold text-default">{{ t('auth.login-form.title') }}</h1>
        <p class="mt-2 text-sm text-muted">
          {{ t('auth.login-form.subtitle') }}
        </p>
      </div>
    </template>

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="handleSubmit"
    >
      <UFormField :label="t('auth.email')" name="email" required class="w-full">
        <UInput
          v-model="state.email"
          type="email"
          :placeholder="t('auth.login-form.email-placeholder')"
          autocomplete="email"
          size="lg"
           class="w-full"
        />
      </UFormField>

      <UFormField :label="t('auth.password')" name="password" required class="w-full">
        <UInput
          v-model="state.password"
          type="password"
          :placeholder="t('auth.login-form.password-placeholder')"
          autocomplete="current-password"
          size="lg"
           class="w-full"
        />
      </UFormField>

      <div class="flex items-center justify-between">
        <UCheckbox
          v-model="rememberMe"
          :label="t('auth.remember-me')"
        />
        <NuxtLink
          to="/auth/forgot-password"
          class="text-sm font-medium text-primary hover:text-primary"
        >
          {{ t('auth.login-form.forgot-password-link') }}
        </NuxtLink>
      </div>

      <UButton
        type="submit"
        color="primary"
        size="lg"
        block
        :loading="isLoading"
      >
        {{ t('auth.login-form.submit-button') }}
      </UButton>
    </UForm>

    <template #footer>
      <div class="text-center text-sm text-muted">
        {{ t('auth.login-form.no-account') }}
        <NuxtLink
          to="/auth/register"
          class="font-medium text-primary hover:text-primary"
        >
          {{ t('auth.login-form.register-link') }}
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { useLogin } from '@auth/composables/auth/use-login'

const { t } = useI18n()
const { schema, state, isLoading, handleSubmit } = useLogin()
const rememberMe = ref(false)
</script>

