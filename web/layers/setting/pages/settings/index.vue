<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-default">
        {{ t('setting.title') }}
      </h1>
      <p class="mt-2 text-sm text-muted">
        {{ t('setting.subtitle') }}
      </p>
    </div>

    <div class="flex flex-row justify-start items-stretch gap-4">
      <UTabs
        v-model="selectedTab"
        :items="tabs"
        orientation="vertical"
        class="w-64 flex-shrink-0 flex justify-start items-start"
        :ui="{
          list: 'items-stretch',
          leadingIcon: 'size-4',
        }"
      />

      <div class="flex-1">
        <SettingsProfile v-if="selectedTab === 'profile'" />
        <SettingsSecurity v-else-if="selectedTab === 'security'" />
        <SettingsNotification v-else-if="selectedTab === 'notification'" />
        <SettingsSystemConfig v-else-if="selectedTab === 'system'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const router = useRouter()

definePageMeta({
  layout: 'dashboard',
})

// Get initial tab from query params or default to 'profile'
const selectedTab = ref((route.query.tab as string) || 'profile')

// Watch for tab changes in query params
watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string') {
    selectedTab.value = newTab
  }
})

// Watch for tab selection changes and update URL
watch(selectedTab, (newTab) => {
  router.replace({
    query: {
      ...route.query,
      tab: newTab,
    },
  })
})

const tabs = computed(() => [
  {
    label: t('setting.profile.title'),
    value: 'profile',
    icon: 'i-lucide-user',
  },
  {
    label: t('setting.security.title'),
    value: 'security',
    icon: 'i-lucide-lock',
  },
  {
    label: t('setting.notification.title'),
    value: 'notification',
    icon: 'i-lucide-bell',
  },
  {
    label: t('setting.system-config.title'),
    value: 'system',
    icon: 'i-lucide-settings',
  },
])
</script>
