/**
 * Use Setting Notification Composable
 * Manages notification settings
 * Layer 2: Shared composable with createSharedComposable
 */
import { createSharedComposable } from '@vueuse/core'
import type { NotificationSettings } from '@setting/types/setting'
import { useSettingApi } from '@setting/utils/setting-api'

const _useSettingNotification = () => {
  const settings = ref<NotificationSettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const api = useSettingApi()

  const fetchSettings = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await api.getNotificationSettings()
      settings.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch notification settings'
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (data: NotificationSettings) => {
    loading.value = true
    error.value = null
    try {
      const updated = await api.updateNotificationSettings(data)
      settings.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update notification settings'
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    settings.value = null
    error.value = null
  }

  onUnmounted(() => {
    // Optional cleanup
  })

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    reset,
  }
}

export const useSettingNotification = createSharedComposable(_useSettingNotification)

