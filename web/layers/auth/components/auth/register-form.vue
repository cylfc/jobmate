<template>
  <UCard>
    <template #header>
      <div class="text-center">
        <h1 class="text-2xl font-bold text-default">{{ t('auth.register-form.title') }}</h1>
        <p class="mt-2 text-sm text-muted">
          {{ t('auth.register-form.subtitle') }}
        </p>
      </div>
    </template>

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="handleSubmit"
    >
      <div class="grid grid-cols-2 gap-4">
        <UFormField :label="t('auth.first-name')" name="firstName" required class="w-full">
          <UInput
            v-model="state.firstName"
            :placeholder="t('auth.register-form.first-name-placeholder')"
            autocomplete="given-name"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('auth.last-name')" name="lastName" required class="w-full">
          <UInput
            v-model="state.lastName"
            :placeholder="t('auth.register-form.last-name-placeholder')"
            autocomplete="family-name"
            size="lg"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField :label="t('auth.email')" name="email" required class="w-full">
        <UInput
          v-model="state.email"
          type="email"
          :placeholder="t('auth.register-form.email-placeholder')"
          autocomplete="email"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('auth.password')" name="password" required class="w-full">
        <UInput
          v-model="state.password"
          type="password"
          :placeholder="t('auth.register-form.password-placeholder')"
          autocomplete="new-password"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField
        :label="t('auth.confirm-password')"
        name="confirmPassword"
        required
        class="w-full"
      >
        <UInput
          v-model="state.confirmPassword"
          type="password"
          :placeholder="t('auth.register-form.confirm-password-placeholder')"
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
        {{ t('auth.register-form.submit-button') }}
      </UButton>
    </UForm>

    <template #footer>
      <div class="text-center text-sm text-muted">
        {{ t('auth.register-form.has-account') }}
        <NuxtLink
          to="/auth/login"
          class="font-medium text-primary hover:text-primary"
        >
          {{ t('auth.register-form.login-link') }}
        </NuxtLink>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { useRegister } from "@auth/composables/auth/use-register";

const { t } = useI18n()
const { schema, state, isLoading, handleSubmit } = useRegister();
</script>
