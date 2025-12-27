<template>
  <div class="h-full container mx-auto">
    <ChatBox
      class="h-full"
      :show-purpose-buttons="true"
      :sticky-footer="true"
      mode="inline"
    />
  </div>
</template>

<script setup lang="ts">
import { initChatSetup, useChatSetup } from '@chat/composables/use-chat-setup'
import type { ChatFeature } from '@chat/types/chat'

definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const { selectedPurpose, setDisplayMode, setSelectedPurpose } = useChatSetup()

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
})
</script>
