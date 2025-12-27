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

const { selectedPurpose, setDisplayMode, setSelectedPurpose } = useChatSetup()
const { initializeChatWithFeature } = useChatHandlers()
const { messages, context, initializeChat } = useChat()

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
  setDisplayMode('inline')
  const feature = (route.query.feature as ChatFeature) || selectedPurpose.value
  setSelectedPurpose(feature)
  // Only initialize if messages are empty or feature changed
  if (messages.length === 0 || (context.value && context.value.feature !== feature)) {
    initializeChatWithFeature(feature, initializeChat)
  }
})
</script>

