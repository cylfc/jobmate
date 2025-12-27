/**
 * Use Setting System Composable
 * Manages system configuration settings
 * Layer 2: Shared composable with createSharedComposable
 */
import { createSharedComposable } from '@vueuse/core'
import type { SystemConfig } from '@setting/types/setting'
import { useSettingApi } from '@setting/utils/setting-api'

const _useSettingSystem = () => {
  const config = ref<SystemConfig | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const api = useSettingApi()

  const fetchConfig = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await api.getSystemConfig()
      config.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch system config'
    } finally {
      loading.value = false
    }
  }

  const updateConfig = async (data: SystemConfig) => {
    loading.value = true
    error.value = null
    try {
      const updated = await api.updateSystemConfig(data)
      config.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update system config'
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    config.value = null
    error.value = null
  }

  onUnmounted(() => {
    // Optional cleanup
  })

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
    reset,
  }
}

export const useSettingSystem = createSharedComposable(_useSettingSystem)

