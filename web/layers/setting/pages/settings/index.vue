<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-default">
        {{ t("setting.title") }}
      </h1>
      <p class="mt-2 text-sm text-muted">
        {{ t("setting.subtitle") }}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 justify-start items-stretch gap-4">
      <div class="lg:col-span-1">
        <UTabs
          :model-value="selectedTab"
          :items="tabsWithLabels"
          orientation="vertical"
          class="w-full items-stretch gap-0"
          :ui="{
            list: 'items-stretch w-full justify-start',
            leadingIcon: 'size-4',
            content: 'hidden'
          }"
          @update:model-value="updateTab"
        />
      </div>

      <div class="flex-1 lg:col-span-3">
        <SettingsProfile v-if="selectedTab === 'profile'" />
        <SettingsSecurity v-else-if="selectedTab === 'security'" />
        <SettingsNotification v-else-if="selectedTab === 'notification'" />
        <SettingsSystemConfig v-else-if="selectedTab === 'system-config'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingTabs } from '@setting/composables/use-setting-tabs'

const { t } = useI18n()

definePageMeta({
  layout: "dashboard",
})

const { tabs, selectedTab, updateTab } = useSettingTabs()

const tabsWithLabels = computed(() => tabs.map(tab => ({
  ...tab,
  label: t(`setting.${tab.value}.title`),
})))
</script>
