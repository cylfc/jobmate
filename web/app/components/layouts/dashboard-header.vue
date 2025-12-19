<template>
  <header class="border-b border-default bg-default sticky top-0 z-50 px-4">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-4">
        <NuxtLink to="/dashboard" class="flex items-center gap-2">
          <UIcon name="i-lucide-briefcase" class="w-8 h-8 text-primary" />
          <span class="text-xl font-bold text-default">JobMate</span>
        </NuxtLink>
      </div>
      <UFieldGroup class="flex items-center">
        <!-- Locale Selector -->
        <ULocaleSelect
          :model-value="locale || 'vi'"
          :locales="availableLocales"
          color="neutral"
          variant="outline"
          class="w-auto"
          :ui="{
            leadingIcon: 'size-4 text-default',
            trailingIcon: 'size-4 text-default',
            itemLeadingIcon: 'size-4 text-default',
            itemLeadingAvatar: 'size-4 text-default',
          }"
          @update:model-value="handleLocaleChange($event)"
        />

        <!-- Color Mode Button -->
        <UColorModeButton color="neutral" variant="outline" square />

        <!-- Notification Drawer (includes trigger button) -->
        <LayoutsNotificationDrawer v-model="isNotificationDrawerOpen" />

        <!-- Chat Button -->
        <UButton
          to="/chat?feature=matching"
          color="primary"
          variant="outline"
          square
          icon="i-lucide-message-circle"
          :ui="{
            square: 'rounded-lg'
          }"
        >
          <span class="sr-only">{{ t('nav.chat') }}</span>
        </UButton>

        <!-- User Profile -->
        <UDropdownMenu :items="userMenuItems">
          <UButton
            color="neutral"
            variant="outline"
            size="sm"
            class="flex items-center gap-2"
          >
            <UIcon name="i-lucide-user" class="w-4 h-4" />
            <span class="hidden md:inline text-sm font-medium">John Doe</span>
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
          </UButton>
        </UDropdownMenu>
      </UFieldGroup>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { vi, en } from "@nuxt/ui/locale";

const { locale, setLocale, t } = useI18n();
const isNotificationDrawerOpen = ref(false);

const availableLocales = [vi, en];

const handleLocaleChange = (value: string | undefined) => {
  if (value && (value === "vi" || value === "en")) {
    setLocale(value);
  }
};

const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: t("setting.title"),
      icon: "i-lucide-settings",
      to: "/settings",
    },
  ],
  [
    {
      label: t("auth.logout"),
      icon: "i-lucide-log-out",
      onSelect: () => {
        // TODO: Implement logout
        console.log("Logout");
      },
    },
  ],
]);
</script>
