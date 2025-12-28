<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">
            {{ t('setting.profile.title') }}
          </h2>
          <p class="mt-1 text-xs text-muted">
            {{ t('setting.profile.subtitle') }}
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
          :disabled="true"
          class="w-full"
        />
        <template #hint>
          <p class="text-sm text-muted mt-1">
            {{ t('setting.profile.email-readonly-hint', 'Email cannot be changed') }}
          </p>
        </template>
      </UFormField>

      <UFormField :label="t('setting.profile.phone')" name="phone" class="w-full">
        <UInput
          v-model="form.phone"
          :placeholder="t('setting.profile.phone-placeholder')"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('setting.profile.bio')" name="bio" class="w-full">
        <UTextarea
          v-model="form.bio"
          :placeholder="t('setting.profile.bio-placeholder')"
          :rows="4"
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
          :loading="loading"
        >
          {{ t('setting.profile.save-button') }}
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { z } from 'zod'
import { useSettingProfile } from '@setting/composables/use-setting-profile'
import type { UserProfile } from '@setting/types/setting'

const { t } = useI18n()
const toast = useToast()

const {
  profile,
  loading,
  error,
  fetchProfile,
  updateProfile,
} = useSettingProfile()

const form = ref<UserProfile>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
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
  bio: z.string().optional(),
}).refine((data) => {
  // Email is read-only, so we don't validate it for updates
  return true
}))

// Load user profile data
onMounted(async () => {
  await fetchProfile()
  if (profile.value) {
    form.value = { ...profile.value }
  }
})

// Watch for profile changes
watch(profile, (newProfile) => {
  if (newProfile) {
    form.value = { ...newProfile }
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    await updateProfile(form.value)
    toast.add({
      title: t('setting.profile.success.title'),
      description: t('setting.profile.success.description'),
      color: 'success',
    })
  } catch (_error) {
    toast.add({
      title: t('setting.profile.error.title'),
      description: error.value || t('setting.profile.error.description'),
      color: 'error',
    })
  }
}

const handleReset = async () => {
  await fetchProfile()
  if (profile.value) {
    form.value = { ...profile.value }
  }
}
</script>

