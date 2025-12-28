<template>
  <header class="border-b border-default bg-default sticky top-0 z-50 px-4">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-4">
        <TheLogo to="/dashboard" />
      </div>
      <UFieldGroup class="flex items-center">
        <!-- Locale Selector -->
        <ULocaleSelect
          :model-value="locale || 'vi'"
          :locales="availableLocales"
          color="primary"
          variant="soft"
          class="w-auto"
          :ui="{
            base: 'bg-primary/10 hover:bg-primary/15 active:bg-primary/15 text-primary',
            leadingIcon: 'size-4 text-primary',
            trailingIcon: 'size-4 text-primary',
            itemLeadingIcon: 'size-4 text-primary',
            itemLeadingAvatar: 'size-4 text-primary',
          }"
          @update:model-value="handleLocaleChange($event)"
        />

        <!-- Color Mode Button -->
        <UColorModeButton color="primary" variant="soft" square />

        <!-- Notification Drawer (includes trigger button) -->
        <LayoutsNotificationDrawer v-model="isNotificationDrawerOpen" />

        <!-- Chat Button -->
        <UButton
          to="/chat?feature=matching"
          color="primary"
          variant="soft"
          square
          icon="i-lucide-message-circle"
        >
          <span class="sr-only">{{ t('nav.chat') }}</span>
        </UButton>

        <!-- User Profile -->
        <UDropdownMenu :items="userMenuItems">
          <UButton
            color="primary"
            variant="soft"
            size="sm"
            class="flex items-center gap-2"
          >
            <UIcon name="i-lucide-user" class="w-5 h-5" />
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
