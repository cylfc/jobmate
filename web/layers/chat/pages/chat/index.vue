<template>
  <div class="h-full container mx-auto">
    <ChatBox
      class="h-full"
      :messages="messages"
      :is-loading="isLoading"
      :show-purpose-buttons="true"
      @send="handleSend"
      @purpose-select="handlePurposeSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { useMatchingState } from '@matching/composables/use-matching-state'
import { initChatSetup, useChatSetup } from '@chat/composables/use-chat-setup'
import { useChatHandlers } from '@chat/composables/use-chat-handlers'
import type { ChatFeature } from '@chat/types/chat'

const { t } = useI18n()

definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const router = useRouter()

const { messages, isLoading, initializeChat, sendMessage } = useChat()
const chatSetup = useChatSetup()
const chatHandlers = useChatHandlers()

initChatSetup({
  status: 'ready',
  shouldAutoScroll: true,
  shouldScrollToBottom: true,
  autoScroll: true,
  compact: false,
  spacingOffset: 0,
  displayMode: 'inline',
  selectedPurpose: 'matching',
})

onMounted(() => {
  chatSetup.setDisplayMode('inline')
  const feature = (route.query.feature as ChatFeature) || chatSetup.selectedPurpose.value
  chatSetup.setSelectedPurpose(feature)
  chatHandlers.initializeChatWithFeature(feature, initializeChat)
})

const handleSend = async (message: string) => {
  await sendMessage(message)
}

const handlePurposeSelect = (purpose: ChatFeature) => {
  chatSetup.setSelectedPurpose(purpose)
  const success = chatHandlers.initializeChatWithFeature(purpose, initializeChat)
  if (!success) {
    console.warn(`Failed to initialize chat for purpose: ${purpose}`)
  }
}
</script>

