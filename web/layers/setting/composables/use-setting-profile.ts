/**
 * Use Setting Profile Composable
 * Manages user profile settings
 * Layer 2: Shared composable with createSharedComposable
 */
import { createSharedComposable } from '@vueuse/core'
import type { UserProfile } from '@setting/types/setting'
import { useSettingApi } from '@setting/utils/setting-api'

const _useSettingProfile = () => {
  const profile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const api = useSettingApi()

  const fetchProfile = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await api.getProfile()
      profile.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch profile'
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (data: UserProfile) => {
    loading.value = true
    error.value = null
    try {
      const updated = await api.updateProfile(data)
      profile.value = updated
      return updated
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    profile.value = null
    error.value = null
  }

  onUnmounted(() => {
    // Optional cleanup
  })

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    reset,
  }
}

export const useSettingProfile = createSharedComposable(_useSettingProfile)

