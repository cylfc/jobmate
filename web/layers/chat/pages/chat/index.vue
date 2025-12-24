<template>
  <div class="h-full container mx-auto">
    <ChatBox
      class="h-full"
      :show-purpose-buttons="true"
    />
  </div>
</template>

<script setup lang="ts">
import { initChatSetup, useChatSetup } from '@chat/composables/use-chat-setup'
import { useChatHandlers } from '@chat/composables/use-chat-handlers'
import { useChat } from '@chat/composables/use-chat'
import type { ChatFeature } from '@chat/types/chat'

definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()

const chatSetup = useChatSetup()
const chatHandlers = useChatHandlers()
const chat = useChat()

initChatSetup({
  status: 'ready',
  shouldAutoScroll: true,
  shouldScrollToBottom: true,
  autoScroll: true,
  compact: false,
  spacingOffset: 0,
  displayMode: 'inline',
  selectedPurpose: 'matching',
  assistant: {
    variant: 'soft',
  },
})

onMounted(() => {
  chatSetup.setDisplayMode('inline')
  const feature = (route.query.feature as ChatFeature) || chatSetup.selectedPurpose.value
  chatSetup.setSelectedPurpose(feature)
  // Only initialize if messages are empty or feature changed
  if (chat.messages.value.length === 0 || chat.context.value?.feature !== feature) {
    chatHandlers.initializeChatWithFeature(feature, chat.initializeChat)
  }
})
</script>

