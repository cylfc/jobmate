<template>
  <header class="border-b border-gray-200 bg-white sticky top-0 z-50 px-4">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-4">
        <NuxtLink to="/dashboard" class="flex items-center gap-2">
          <UIcon name="i-lucide-briefcase" class="w-8 h-8 text-primary-600" />
          <span class="text-xl font-bold text-gray-900">JobMate</span>
        </NuxtLink>
      </div>
      <div class="flex items-center gap-2">
        <!-- Locale Selector -->
        <UDropdownMenu :items="localeMenuItems">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-globe"
            aria-label="Language"
            square
          />
        </UDropdownMenu>

        <!-- Notifications -->
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-bell"
          aria-label="Notifications"
          class="relative"
          square
          @click="isNotificationDrawerOpen = true"
        >
          <UBadge
            v-if="notificationCount > 0"
            :label="notificationCount > 9 ? '9+' : notificationCount.toString()"
            color="error"
            class="absolute -top-1 -right-1"
          />
        </UButton>

        <!-- Notification Drawer -->
        <LayoutsNotificationDrawer v-model="isNotificationDrawerOpen" />

        <!-- User Profile -->
        <UDropdownMenu :items="userMenuItems">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            class="flex items-center gap-2"
          >
            <UIcon name="i-lucide-user" class="w-4 h-4" />
            <span class="hidden md:inline text-sm font-medium">John Doe</span>
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
          </UButton>
        </UDropdownMenu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

const notificationCount = ref(3);
const selectedLocale = ref("vi");
const isNotificationDrawerOpen = ref(false);

const localeMenuItems: DropdownMenuItem[][] = [
  [
    {
      label: "Tiếng Việt",
      icon: "i-lucide-languages",
      onSelect: () => {
        selectedLocale.value = "vi";
        // TODO: Implement locale change
      },
    },
    {
      label: "Tiếng Anh",
      icon: "i-lucide-languages",
      onSelect: () => {
        selectedLocale.value = "en";
        // TODO: Implement locale change
      },
    },
  ],
];

const userMenuItems: DropdownMenuItem[][] = [
  [
    {
      label: "Hồ sơ",
      icon: "i-lucide-user",
      to: "/dashboard/profile",
    },
    {
      label: "Cài đặt",
      icon: "i-lucide-settings",
      to: "/dashboard/settings",
    },
  ],
  [
    {
      label: "Đăng xuất",
      icon: "i-lucide-log-out",
      onSelect: () => {
        // TODO: Implement logout
        console.log("Logout");
      },
    },
  ],
];
</script>
