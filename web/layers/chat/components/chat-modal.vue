<template>
  <UModal
    v-model:open="isOpen"
    :ui="{
      width: 'w-full sm:max-w-2xl',
      height: 'h-[calc(100vh-4rem)]',
      overlay: {
        background: 'bg-black/50 dark:bg-black/50',
      },
      container: 'fixed bottom-4 right-4',
    }"
    :prevent-close="false"
  >
    <template #content>
      <div class="w-full sm:max-w-2xl h-[calc(100vh-8rem)] flex flex-col">
        <ChatBox
          :messages="messages"
          :is-loading="isLoading"
          :show-purpose-buttons="showPurposeButtons"
          :selected-purpose="selectedPurpose"
          @send="handleSend"
          @purpose-select="handlePurposeSelect"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { ChatMessage, ChatFeature } from '@chat/types/chat'

interface Props {
  /**
   * Whether modal is open
   */
  modelValue: boolean
  /**
   * Chat messages
   */
  messages: ChatMessage[]
  /**
   * Whether chat is loading
   */
  isLoading?: boolean
  /**
   * Show purpose buttons
   */
  showPurposeButtons?: boolean
  /**
   * Selected purpose
   */
  selectedPurpose?: ChatFeature
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'send', message: string): void
  (e: 'purpose-select', purpose: ChatFeature): void
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  showPurposeButtons: true,
  selectedPurpose: 'matching',
})

const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleSend = (message: string) => {
  emit('send', message)
}

const handlePurposeSelect = (purpose: ChatFeature) => {
  emit('purpose-select', purpose)
}
</script>

