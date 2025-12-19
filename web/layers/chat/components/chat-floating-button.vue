<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="shouldShow"
      class="fixed bottom-4 right-4 z-50"
    >
      <UButton
        :to="chatUrl"
        color="primary"
        size="xl"
        :icon="isOpen ? 'i-lucide-x' : 'i-lucide-message-circle'"
        class="shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-4"
        :style="isOpen ? 'transform: rotate(90deg)' : ''"
        @click="handleClick"
      >
        <span class="sr-only">{{ t('chat.open', { defaultValue: 'Mở chat' }) }}</span>
        
        <!-- Badge for unread messages (optional) -->
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-error rounded-full"
        >
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </UButton>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

interface Props {
  feature?: string
  show?: boolean
  unreadCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  feature: 'matching',
  show: true,
  unreadCount: 0,
})

const chatUrl = computed(() => `/chat?feature=${props.feature}`)
const isOpen = computed(() => route.path.startsWith('/chat'))

// Hide button when on chat page
const shouldShow = computed(() => props.show && !isOpen.value)

const handleClick = () => {
  if (!isOpen.value) {
    navigateTo(chatUrl.value)
  }
}
</script>

