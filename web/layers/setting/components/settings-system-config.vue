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
            :items="timezoneOptions"
            value-key="value"
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
            :items="dateFormatOptions"
            value-key="value"
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
            :items="timeFormatOptions"
            value-key="value"
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
          :loading="loading"
          @click="handleSubmit"
        >
          {{ t('setting.system-config.save-button') }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useSettingSystem } from '@setting/composables/use-setting-system'
import { useSettingApi } from '@setting/utils/setting-api'
import { COMMON_TIMEZONES, DATE_FORMATS, TIME_FORMATS, THEMES, LANGUAGES } from '@setting/constants/system-config.constants'
import type { SystemConfig, SystemConfigOptions } from '@setting/types/setting'

const { t } = useI18n()
const toast = useToast()
const colorMode = useColorMode()

const {
  config,
  loading,
  error,
  fetchConfig,
  updateConfig,
} = useSettingSystem()

const api = useSettingApi()

const form = ref<SystemConfig>({
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
})

// Options for dropdowns
const options = ref<SystemConfigOptions | null>(null)

// Load options from backend
const loadOptions = async () => {
  try {
    options.value = await api.getSystemConfigOptions()
  } catch (err) {
    console.error('Failed to load system config options:', err)
    // Fallback to default options if API fails
    options.value = {
      timezones: [...COMMON_TIMEZONES],
      dateFormats: [...DATE_FORMATS],
      timeFormats: [...TIME_FORMATS],
      themes: [...THEMES],
      languages: [...LANGUAGES],
    }
  }
}

// Get timezone options
const timezoneOptions = computed(() => {
  if (!options.value) return []
  return options.value.timezones.map(tz => ({
    label: tz.replace(/_/g, ' '),
    value: tz,
  }))
})

// Get date format options
const dateFormatOptions = computed(() => {
  if (!options.value) return []
  return options.value.dateFormats.map(format => ({
    label: format,
    value: format,
  }))
})

// Get time format options
const timeFormatOptions = computed(() => {
  if (!options.value) return []
  return options.value.timeFormats.map(format => ({
    label: format === '24h' 
      ? t('setting.system-config.time-format.24h', '24 hours')
      : t('setting.system-config.time-format.12h', '12 hours'),
    value: format,
  }))
})

// Load system config and options
onMounted(async () => {
  await Promise.all([
    fetchConfig(),
    loadOptions(),
  ])
  if (config.value) {
    form.value = { ...config.value }
  }
})

// Watch for config changes
watch(config, (newConfig) => {
  if (newConfig) {
    form.value = { ...newConfig }
  }
}, { immediate: true })

const handleSubmit = async () => {
  try {
    await updateConfig(form.value)
    toast.add({
      title: t('setting.system-config.success.title'),
      description: t('setting.system-config.success.description'),
      color: 'success',
    })
  } catch (_error) {
    toast.add({
      title: t('setting.system-config.error.title'),
      description: error.value || t('setting.system-config.error.description'),
      color: 'error',
    })
  }
}

const handleReset = async () => {
  await fetchConfig()
  if (config.value) {
    form.value = { ...config.value }
  }
}
</script>

