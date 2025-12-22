<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">
            {{ t('setting.system-config.title') }}
          </h2>
          <p class="mt-1 text-xs text-muted">
            {{ t('setting.system-config.subtitle') }}
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Color Mode -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-semibold text-default">
              {{ t('setting.system-config.color-mode.title') }}
            </h3>
            <p class="mt-1 text-xs text-muted">
              {{ t('setting.system-config.color-mode.description') }}
            </p>
          </div>
          <UColorModeButton
            color="primary"
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      <USeparator />

      <!-- Timezone -->
      <div class="space-y-4">
        <UFormField :label="t('setting.system-config.timezone.title')" name="timezone" class="w-full">
          <USelectMenu
            v-model="form.timezone"
            :options="timezoneOptions"
            :placeholder="t('setting.system-config.timezone.placeholder')"
            class="w-full"
          />
          <template #hint>
            <p class="text-sm text-muted mt-1">
              {{ t('setting.system-config.timezone.hint') }}
            </p>
          </template>
        </UFormField>
      </div>

      <USeparator />

      <!-- Date Format -->
      <div class="space-y-4">
        <UFormField :label="t('setting.system-config.date-format.title')" name="dateFormat" class="w-full">
          <USelectMenu
            v-model="form.dateFormat"
            :options="dateFormatOptions"
            :placeholder="t('setting.system-config.date-format.placeholder')"
            class="w-full"
          />
        </UFormField>
      </div>

      <USeparator />

      <!-- Time Format -->
      <div class="space-y-4">
        <UFormField :label="t('setting.system-config.time-format.title')" name="timeFormat" class="w-full">
          <USelectMenu
            v-model="form.timeFormat"
            :options="timeFormatOptions"
            :placeholder="t('setting.system-config.time-format.placeholder')"
            class="w-full"
          />
        </UFormField>
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
          {{ t('setting.system-config.save-button') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()
const colorMode = useColorMode()

interface SystemConfigForm {
  timezone: string
  dateFormat: string
  timeFormat: string
}

const form = ref<SystemConfigForm>({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
})

const isSaving = ref(false)

// Get all timezones
const timezoneOptions = computed(() => {
  const timezones = Intl.supportedValuesOf('timeZone')
  return timezones.map(tz => ({
    label: tz.replace(/_/g, ' '),
    value: tz,
  }))
})

const dateFormatOptions = computed(() => [
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
  { label: 'DD MMM YYYY', value: 'DD MMM YYYY' },
])

const timeFormatOptions = computed(() => [
  { label: t('setting.system-config.time-format.24h'), value: '24h' },
  { label: t('setting.system-config.time-format.12h'), value: '12h' },
])

// Load system config
onMounted(async () => {
  await loadSettings()
})

const loadSettings = async () => {
  try {
    // TODO: Call API to load system config
    // const settings = await $fetch('/api/settings/system-config')
    // form.value = settings
    
    // Load from localStorage or use defaults
    const savedTimezone = localStorage.getItem('timezone')
    const savedDateFormat = localStorage.getItem('dateFormat')
    const savedTimeFormat = localStorage.getItem('timeFormat')
    
    if (savedTimezone) form.value.timezone = savedTimezone
    if (savedDateFormat) form.value.dateFormat = savedDateFormat
    if (savedTimeFormat) form.value.timeFormat = savedTimeFormat
  } catch (error) {
    console.error('Error loading system config:', error)
  }
}

const handleSubmit = async () => {
  isSaving.value = true
  try {
    // TODO: Call API to save system config
    // await $fetch('/api/settings/system-config', {
    //   method: 'PUT',
    //   body: form.value,
    // })
    
    // Save to localStorage for now
    localStorage.setItem('timezone', form.value.timezone)
    localStorage.setItem('dateFormat', form.value.dateFormat)
    localStorage.setItem('timeFormat', form.value.timeFormat)
    
    toast.add({
      title: t('setting.system-config.success.title'),
      description: t('setting.system-config.success.description'),
      color: 'success',
    })
  } catch (_error) {
    toast.add({
      title: t('setting.system-config.error.title'),
      description: t('setting.system-config.error.description'),
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

