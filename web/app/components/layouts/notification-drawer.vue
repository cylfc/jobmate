<!-- eslint-disable vue/no-multiple-template-root -->
<template>
  <!-- Notification Button Trigger -->
  <UButton
    color="neutral"
    variant="outline"
    icon="i-lucide-bell"
    :aria-label="t('dashboard.notifications')"
    class="relative"
    square
    @click="isOpen = true"
  >
    <UBadge
      v-if="unreadCount > 0"
      :label="unreadCount > 9 ? '9+' : unreadCount.toString()"
      color="error"
      size="sm"
      class="absolute -top-2 -right-1 !rounded-sm"
    />
  </UButton>

  <UDrawer
    :open="isOpen"
    direction="right"
    :ui="{
      content: 'm-4 rounded-lg overflow-hidden',
    }"
    @update:open="isOpen = $event"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-default">
          {{ t("notification.title") }}
        </h2>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          size="sm"
          @click="isOpen = false"
          :aria-label="t('common.close')"
        />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col h-full">
        <!-- Notification List -->
        <div class="flex-1 overflow-y-auto">
          <div
            v-if="notifications.length === 0"
            class="flex flex-col items-center justify-center h-full py-12"
          >
            <UIcon
              name="i-lucide-bell-off"
              class="w-12 h-12 text-dimmed mb-4"
            />
            <p class="text-sm text-muted">
              {{ t("notification.no-notifications") }}
            </p>
          </div>

          <div v-else class="divide-y divide-default">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="p-4 hover:bg-muted transition-colors cursor-pointer"
              :class="{ 'bg-muted': !notification.read }"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex items-start gap-3">
                <div
                  class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  :class="getNotificationIconClass(notification.type)"
                >
                  <UIcon
                    :name="getNotificationIcon(notification.type)"
                    class="w-5 h-5"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-default">
                    {{ notification.title }}
                  </p>
                  <p class="text-sm text-muted mt-1">
                    {{ notification.message }}
                  </p>
                  <p class="text-xs text-dimmed mt-2">
                    {{ formatTime(notification.createdAt) }}
                  </p>
                </div>
                <div v-if="!notification.read" class="flex-shrink-0">
                  <div class="w-2 h-2 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div
          v-if="notifications.length > 0"
          class="border-t border-default p-4"
        >
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            class="w-full"
            @click="markAllAsRead"
          >
            {{ t("notification.mark-all-read") }}
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
const { t } = useI18n();

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

// Mock notifications data
const notifications = computed<Notification[]>(() => [
  {
    id: "1",
    type: "info",
    title: t("notification.new-candidate"),
    message: t("notification.new-candidate-message", {
      count: 3,
      position: "Frontend Developer",
    }),
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: "2",
    type: "success",
    title: t("notification.matching-complete"),
    message: t("notification.matching-complete-message", { count: 5 }),
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: "3",
    type: "warning",
    title: t("notification.reminder"),
    message: t("notification.reminder-message", { count: 2 }),
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "4",
    type: "info",
    title: t("notification.system-update"),
    message: t("notification.system-update-message"),
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
]);

const getNotificationIcon = (type: Notification["type"]) => {
  const icons = {
    info: "i-lucide-info",
    success: "i-lucide-check-circle",
    warning: "i-lucide-alert-triangle",
    error: "i-lucide-alert-circle",
  };
  return icons[type];
};

const getNotificationIconClass = (type: Notification["type"]) => {
  const classes = {
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
  };
  return classes[type];
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return t("notification.just-now");
  if (minutes < 60) return t("notification.minutes-ago", { count: minutes });
  if (hours < 24) return t("notification.hours-ago", { count: hours });
  return t("notification.days-ago", { count: days });
};

const handleNotificationClick = (notification: Notification) => {
  notification.read = true;
  // TODO: Navigate to notification detail or related page
};

const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.read = true;
  });
};

const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.read).length;
});
</script>
