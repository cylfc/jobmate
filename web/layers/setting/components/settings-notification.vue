<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">
            {{ t('setting.notification.title') }}
          </h2>
          <p class="mt-1 text-xs text-muted">
            {{ t('setting.notification.subtitle') }}
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Email Notifications -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-default">
          {{ t('setting.notification.email.title') }}
        </h3>
        <div class="space-y-3">
          <UCheckbox
            v-model="form.emailJobMatches"
            :label="t('setting.notification.email.job-matches')"
          />
          <UCheckbox
            v-model="form.emailNewCandidates"
            :label="t('setting.notification.email.new-candidates')"
          />
          <UCheckbox
            v-model="form.emailWeeklyDigest"
            :label="t('setting.notification.email.weekly-digest')"
          />
        </div>
      </div>

      <USeparator />

      <!-- Push Notifications -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-default">
          {{ t('setting.notification.push.title') }}
        </h3>
        <div class="space-y-3">
          <UCheckbox
            v-model="form.pushJobMatches"
            :label="t('setting.notification.push.job-matches')"
          />
          <UCheckbox
            v-model="form.pushNewCandidates"
            :label="t('setting.notification.push.new-candidates')"
          />
          <UCheckbox
            v-model="form.pushMessages"
            :label="t('setting.notification.push.messages')"
          />
        </div>
      </div>

      <USeparator />

      <!-- In-App Notifications -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-default">
          {{ t('setting.notification.in-app.title') }}
        </h3>
        <div class="space-y-3">
          <UCheckbox
            v-model="form.inAppJobMatches"
            :label="t('setting.notification.in-app.job-matches')"
          />
          <UCheckbox
            v-model="form.inAppNewCandidates"
            :label="t('setting.notification.in-app.new-candidates')"
          />
          <UCheckbox
            v-model="form.inAppMessages"
            :label="t('setting.notification.in-app.messages')"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <UButton
          color="neutral"
          variant="ghost"
          @click="handleReset"
        >
          {{ t('common.cancel') }}
        </UButton>
        <UButton
          color="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          {{ t('setting.notification.save-button') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useSettingNotification } from '@setting/composables/use-setting-notification'
import type { NotificationSettings } from '@setting/types/setting'

const { t } = useI18n()
const toast = useToast()

const {
  settings,
  loading,
  error,
  fetchSettings,
  updateSettings,
} = useSettingNotification()

const form = ref<NotificationSettings>({
  emailJobMatches: true,
  emailNewCandidates: true,
  emailWeeklyDigest: false,
  pushJobMatches: true,
  pushNewCandidates: true,
  pushMessages: true,
  inAppJobMatches: true,
  inAppNewCandidates: true,
  inAppMessages: true,
})

// Load notification settings
onMounted(async () => {
  await fetchSettings()
  if (settings.value) {
    form.value = { ...settings.value }
  }
})

// Watch for settings changes
watch(settings, (newSettings) => {
  if (newSettings) {
    form.value = { ...newSettings }
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    await updateSettings(form.value)
    toast.add({
      title: t('setting.notification.success.title'),
      description: t('setting.notification.success.description'),
      color: 'success',
    })
  } catch (_error) {
    toast.add({
      title: t('setting.notification.error.title'),
      description: error.value || t('setting.notification.error.description'),
      color: 'error',
    })
  }
}

const handleReset = async () => {
  await fetchSettings()
  if (settings.value) {
    form.value = { ...settings.value }
  }
}
</script>

