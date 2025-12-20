<template>
  <UModal
    :open="isModalOpen"
    :ui="{
      wrapper: 'items-end justify-end p-4',
      content: 'w-full',
    }"
    :prevent-close="false"
    @close="chatSetup.closeModal()"
  >
    <template #content>
      <div class="flex flex-col">
        <ChatBox
          class="h-full flex flex-col"
          :messages="chatMessages"
          :is-loading="isChatLoading"
          :show-purpose-buttons="true"
          :sticky-footer="true"
          :selected-purpose="selectedPurpose"
          @send="handleSend"
          @purpose-select="handlePurposeSelect"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { ChatFeature } from '@chat/types/chat'
import { useMatchingChatHandler } from '@chat/composables/use-matching-chat-handler'

const route = useRoute()
const chatSetup = useChatSetup()

// Get chat messages from useChat
const chatComposable = useChat()

// Initialize handlers at top level (required by Vue Composition API)
const matchingHandler = useMatchingChatHandler()

// Use messages from composable
const chatMessages = computed(() => {
  return [...chatComposable.messages.value]
})

const isChatLoading = computed(() => {
  return chatComposable.isLoading.value
})

const selectedPurpose = ref<ChatFeature>('matching')

// Check if we're on chat page
const isChatPage = computed(() => route.path === '/chat')

// Show modal only when not on chat page and displayMode is 'modal'
const shouldShowModal = computed(() => !isChatPage.value && chatSetup.displayMode.value === 'modal')

// Modal state from store - only open if shouldShowModal is true
const isModalOpen = computed(() => shouldShowModal.value && chatSetup.isModalOpen.value)

const handleSend = async (message: string) => {
  await chatComposable.sendMessage(message)
}

const handlePurposeSelect = (purpose: ChatFeature) => {
  selectedPurpose.value = purpose
  
  // Initialize chat with selected purpose
  if (purpose === 'matching') {
    chatComposable.initializeChat('matching', matchingHandler)
  }
  // TODO: Add handlers for other purposes
}

// Initialize chat when modal opens if not already initialized
watch(isModalOpen, (open) => {
  if (open && chatComposable.messages.value.length === 0) {
    // Initialize chat with default purpose
    if (selectedPurpose.value === 'matching') {
      chatComposable.initializeChat('matching', matchingHandler)
    }
  }
})
</script>

