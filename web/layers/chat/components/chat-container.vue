<template>
  <div class="flex flex-col h-full bg-default">
    <!-- Header -->
    <div class="border-b border-border p-4 bg-default">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold">{{ title }}</h2>
          <p v-if="subtitle" class="text-sm text-muted">{{ subtitle }}</p>
        </div>
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="$emit('close')"
        >
          {{ t('chat.close', { defaultValue: 'Đóng' }) }}
        </UButton>
      </div>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-2">
      <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
        <p class="text-muted">{{ t('chat.no-messages', { defaultValue: 'Chưa có tin nhắn nào' }) }}</p>
      </div>
      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-muted rounded-lg p-4">
          <UIcon name="i-lucide-loader-2" class="w-5 h-5 animate-spin text-primary" />
        </div>
      </div>
    </div>

    <!-- Input -->
    <ChatInput
      :placeholder="inputPlaceholder"
      :disabled="isLoading"
      :loading="isLoading"
      :show-back="showBack"
      @send="handleSend"
      @back="$emit('back')"
    />
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@chat/types/chat'

const { t } = useI18n()

interface Props {
  title?: string
  subtitle?: string
  messages: ChatMessage[]
  isLoading?: boolean
  inputPlaceholder?: string
  showBack?: boolean
}

interface Emits {
  (e: 'send', message: string): void
  (e: 'back'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Chat',
  isLoading: false,
  inputPlaceholder: 'Nhập tin nhắn của bạn...',
  showBack: false,
})

const emit = defineEmits<Emits>()

const messagesContainer = ref<HTMLElement | null>(null)

const handleSend = (message: string) => {
  emit('send', message)
}

// Auto scroll to bottom when new messages arrive
watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  },
  { immediate: true }
)

// Auto scroll when loading state changes
watch(
  () => props.isLoading,
  () => {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }
)
</script>

