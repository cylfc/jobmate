<template>
  <UDrawer
    :open="isOpen"
    @update:open="isOpen = $event"
    direction="right"
    :ui="{
      width: 'w-full sm:w-96',
    }"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900">Thông báo</h2>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          size="sm"
          @click="isOpen = false"
          aria-label="Close"
        />
      </div>
    </template>

    <template #body>
      <div class="flex flex-col h-full">
        <!-- Notification List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="notifications.length === 0" class="flex flex-col items-center justify-center h-full py-12">
            <UIcon name="i-lucide-bell-off" class="w-12 h-12 text-gray-400 mb-4" />
            <p class="text-sm text-gray-500">Không có thông báo nào</p>
          </div>

          <div v-else class="divide-y divide-gray-200">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              :class="{ 'bg-primary-50': !notification.read }"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex items-start gap-3">
                <div
                  class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  :class="getNotificationIconClass(notification.type)"
                >
                  <UIcon :name="getNotificationIcon(notification.type)" class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ notification.message }}</p>
                  <p class="text-xs text-gray-400 mt-2">{{ formatTime(notification.createdAt) }}</p>
                </div>
                <div v-if="!notification.read" class="flex-shrink-0">
                  <div class="w-2 h-2 bg-primary-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div v-if="notifications.length > 0" class="border-t border-gray-200 p-4">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            class="w-full"
            @click="markAllAsRead"
          >
            Đánh dấu tất cả đã đọc
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>

<script setup lang="ts">
interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: Date
}

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Mock notifications data
const notifications = ref<Notification[]>([
  {
    id: '1',
    type: 'info',
    title: 'Ứng viên mới',
    message: 'Có 3 ứng viên mới ứng tuyển cho vị trí Frontend Developer',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: '2',
    type: 'success',
    title: 'Matching hoàn tất',
    message: 'Đã hoàn tất phân tích matching cho 5 ứng viên',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: '3',
    type: 'warning',
    title: 'Nhắc nhở',
    message: 'Bạn có 2 cuộc phỏng vấn sắp tới trong ngày mai',
    read: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: '4',
    type: 'info',
    title: 'Cập nhật hệ thống',
    message: 'Hệ thống đã được cập nhật với các tính năng mới',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
])

const getNotificationIcon = (type: Notification['type']) => {
  const icons = {
    info: 'i-lucide-info',
    success: 'i-lucide-check-circle',
    warning: 'i-lucide-alert-triangle',
    error: 'i-lucide-alert-circle',
  }
  return icons[type]
}

const getNotificationIconClass = (type: Notification['type']) => {
  const classes = {
    info: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
  }
  return classes[type]
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

const handleNotificationClick = (notification: Notification) => {
  notification.read = true
  // TODO: Navigate to notification detail or related page
}

const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.read = true
  })
}
</script>

