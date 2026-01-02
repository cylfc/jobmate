<template>
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
      color="neutral"
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
        <ClientOnly>
          <span class="hidden md:inline text-sm font-medium">{{ displayName }}</span>
          <template #fallback>
            <span class="hidden md:inline text-sm font-medium">{{ t('auth.guest') }}</span>
          </template>
        </ClientOnly>
        <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
      </UButton>
    </UDropdownMenu>
  </UFieldGroup>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import { vi, en } from "@nuxt/ui/locale";
import { useAuthStore } from '@auth/stores/auth';
import { useAuthApi } from '@auth/utils/auth-api';

const { locale, setLocale, t } = useI18n();
const authStore = useAuthStore();
const authApi = useAuthApi();
const router = useRouter();
const toast = useToast();
const isNotificationDrawerOpen = ref(false);

const availableLocales = [vi, en];

const displayName = computed(() => {
  if (authStore.user) {
    return authStore.fullName || authStore.user.email;
  }
  return t('auth.guest');
});

const handleLocaleChange = (value: string | undefined) => {
  if (value && (value === "vi" || value === "en")) {
    setLocale(value);
  }
};

const handleLogout = async () => {
  try {
    if (authStore.refreshToken) {
      await authApi.logout(authStore.refreshToken, authStore.accessToken || undefined);
    }
    
    authStore.logout();
    
    toast.add({
      title: t('auth.logout-success-title', 'Đăng xuất thành công'),
      description: t('auth.logout-success-description', 'Bạn đã đăng xuất khỏi hệ thống'),
      color: 'success',
    });
    
    await router.push('/auth/login');
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if API call fails, clear local auth state
    authStore.logout();
    
    toast.add({
      title: t('auth.logout-error-title', 'Đăng xuất thất bại'),
      description: t('auth.logout-error-description', 'Đã xảy ra lỗi khi đăng xuất'),
      color: 'error',
    });
    
    await router.push('/auth/login');
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
      onSelect: handleLogout,
    },
  ],
]);
</script>

