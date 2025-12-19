<template>
  <div
    :class="[
      'flex gap-3 p-4',
      message.role === 'user' ? 'justify-end' : 'justify-start',
    ]"
  >
    <div
      v-if="message.role === 'assistant'"
      class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
    >
      <UIcon name="i-lucide-bot" class="w-5 h-5 text-primary" />
    </div>

    <div
      :class="[
        'max-w-[80%] rounded-lg p-4',
        message.role === 'user'
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-default',
      ]"
    >
      <div class="whitespace-pre-wrap">{{ message.content }}</div>
      <div
        :class="[
          'text-xs mt-2',
          message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted',
        ]"
      >
        {{ formatTime(message.timestamp) }}
      </div>
    </div>

    <div
      v-if="message.role === 'user'"
      class="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
    >
      <UIcon name="i-lucide-user" class="w-5 h-5 text-primary-foreground" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@chat/types/chat'

interface Props {
  message: ChatMessage
}

defineProps<Props>()

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
</script>

