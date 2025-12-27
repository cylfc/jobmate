/**
 * Use Setting Tabs Composable
 * Manages setting tab selection via URL query parameters
 * Layer 3: Query params for shareable state
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export type SettingTab = 'profile' | 'security' | 'notification' | 'system-config'

const allowedTabs: SettingTab[] = ['profile', 'security', 'notification', 'system-config']

export const useSettingTabs = () => {
  const route = useRoute()
  const router = useRouter()

  const tabs = [
    { label: 'Profile', value: 'profile' as SettingTab, icon: 'i-lucide-user' },
    { label: 'Security', value: 'security' as SettingTab, icon: 'i-lucide-lock' },
    { label: 'Notification', value: 'notification' as SettingTab, icon: 'i-lucide-bell' },
    { label: 'System Config', value: 'system-config' as SettingTab, icon: 'i-lucide-settings' },
  ]

  const selectedTab = computed<SettingTab>(() => {
    const fromQuery = route.query.tab
    if (typeof fromQuery === 'string' && allowedTabs.includes(fromQuery as SettingTab)) {
      return fromQuery as SettingTab
    }
    return 'profile' // default
  })

  const updateTab = (tab: SettingTab) => {
    router.replace({
      query: {
        ...route.query,
        tab,
      },
    })
  }

  const resetTab = () => {
    const { tab: _, ...rest } = route.query
    router.replace({
      query: rest,
    })
  }

  return {
    tabs,
    selectedTab,
    updateTab,
    resetTab,
  }
}

