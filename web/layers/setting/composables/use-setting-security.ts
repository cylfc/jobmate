/**
 * Use Setting Security Composable
 * Manages security settings
 * Layer 2: Shared composable with createSharedComposable
 */
import { createSharedComposable } from '@vueuse/core'
import type { SecuritySettings } from '@setting/types/setting'
import { useSettingApi } from '@setting/utils/setting-api'

const _useSettingSecurity = () => {
  const settings = ref<SecuritySettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const api = useSettingApi()

  const fetchSettings = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await api.getSecuritySettings()
      settings.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch security settings'
    } finally {
      loading.value = false
    }
  }

  const updateSettings = async (data: SecuritySettings) => {
    loading.value = true
    error.value = null
    try {
      const updated = await api.updateSecuritySettings(data)
      settings.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update security settings'
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

export const useSettingSecurity = createSharedComposable(_useSettingSecurity)

