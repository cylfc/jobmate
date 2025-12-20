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
          :selected-purpose="chatSetup.selectedPurpose.value"
          @send="handleSend"
          @purpose-select="handlePurposeSelect"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useChatHandlers } from '@chat/composables/use-chat-handlers'

const route = useRoute()
const chatSetup = useChatSetup()
const chatHandlers = useChatHandlers()
const chatComposable = useChat()

const chatMessages = computed(() => {
  return [...chatComposable.messages.value]
})

const isChatLoading = computed(() => {
  return chatComposable.isLoading.value
})

const isChatPage = computed(() => route.path === '/chat')
const shouldShowModal = computed(() => !isChatPage.value && chatSetup.displayMode.value === 'modal')
const isModalOpen = computed(() => shouldShowModal.value && chatSetup.isModalOpen.value)

const handleSend = async (message: string) => {
  await chatComposable.sendMessage(message)
}

const handlePurposeSelect = (purpose: ChatFeature) => {
  chatSetup.setSelectedPurpose(purpose)
  chatHandlers.initializeChatWithFeature(purpose, chatComposable.initializeChat)
}

watch(isModalOpen, (open) => {
  if (open && chatComposable.messages.value.length === 0) {
    const purpose = chatSetup.selectedPurpose.value
    chatHandlers.initializeChatWithFeature(purpose, chatComposable.initializeChat)
  }
})
</script>

