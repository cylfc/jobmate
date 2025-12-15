<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">
            {{ t('setting.notification.title') }}
          </h2>
          <p class="mt-1 text-xs text-gray-500">
            {{ t('setting.notification.subtitle') }}
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Email Notifications -->
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-gray-900">
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
        <h3 class="text-sm font-semibold text-gray-900">
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
        <h3 class="text-sm font-semibold text-gray-900">
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
          :loading="isSaving"
          @click="handleSubmit"
        >
          {{ t('setting.notification.save-button') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

interface NotificationForm {
  emailJobMatches: boolean
  emailNewCandidates: boolean
  emailWeeklyDigest: boolean
  pushJobMatches: boolean
  pushNewCandidates: boolean
  pushMessages: boolean
  inAppJobMatches: boolean
  inAppNewCandidates: boolean
  inAppMessages: boolean
}

const form = ref<NotificationForm>({
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

const isSaving = ref(false)

// Load notification settings
onMounted(async () => {
  await loadSettings()
})

const loadSettings = async () => {
  try {
    // TODO: Call API to load notification settings
    // const settings = await $fetch('/api/settings/notification')
    // form.value = settings
  } catch (error) {
    console.error('Error loading notification settings:', error)
  }
}

const handleSubmit = async () => {
  isSaving.value = true
  try {
    // TODO: Call API to save notification settings
    // await $fetch('/api/settings/notification', {
    //   method: 'PUT',
    //   body: form.value,
    // })
    
    toast.add({
      title: t('setting.notification.success.title'),
      description: t('setting.notification.success.description'),
      color: 'success',
    })
  } catch (error) {
    toast.add({
      title: t('setting.notification.error.title'),
      description: t('setting.notification.error.description'),
      color: 'error',
    })
  } finally {
    isSaving.value = false
  }
}

const handleReset = () => {
  loadSettings()
}
</script>

