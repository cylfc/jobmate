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
          class="w-full"
        />
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
          :loading="isSaving"
        >
          {{ t('setting.profile.save-button') }}
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { z } from 'zod'

const { t } = useI18n()
const toast = useToast()

interface ProfileForm {
  firstName: string
  lastName: string
  email: string
  phone?: string
  bio?: string
}

const form = ref<ProfileForm>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  bio: '',
})

const isSaving = ref(false)

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
}))

// Load user profile data
onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  try {
    // TODO: Call API to load user profile
    // const profile = await $fetch('/api/settings/profile')
    // form.value = profile
    
    // Mock data for now
    form.value = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+84 123 456 789',
      bio: 'Software developer with 5+ years of experience',
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

const handleSubmit = async () => {
  isSaving.value = true
  try {
    // TODO: Call API to save profile
    // await $fetch('/api/settings/profile', {
    //   method: 'PUT',
    //   body: form.value,
    // })
    
    toast.add({
      title: t('setting.profile.success.title'),
      description: t('setting.profile.success.description'),
      color: 'success',
    })
  } catch (_error) {
    toast.add({
      title: t('setting.profile.error.title'),
      description: t('setting.profile.error.description'),
      color: 'error',
    })
  } finally {
    isSaving.value = false
  }
}

const handleReset = () => {
  loadProfile()
}
</script>

