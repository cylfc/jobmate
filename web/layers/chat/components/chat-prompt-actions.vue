<template>
  <div>
    <div class="flex items-center gap-2">
      <UButton
        v-if="showActions"
        color="neutral"
        variant="ghost"
        icon="i-lucide-plus"
        square
        size="sm"
        @click="handleAdd"
      />
      <UButton
        v-if="showActions"
        color="neutral"
        variant="ghost"
        icon="i-lucide-settings-2"
        square
        size="sm"
        @click="$emit('settings')"
      />
    </div>

    <!-- Chat Modal (shown when not on chat page) -->
    <ChatModal
      v-if="showModal"
      v-model="isModalOpen"
      :messages="finalMessages"
      :is-loading="finalIsLoading"
      :show-purpose-buttons="showPurposeButtons"
      :selected-purpose="selectedPurpose"
      @send="handleModalSend"
      @purpose-select="handleModalPurposeSelect"
    />
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage, ChatFeature } from '@chat/types/chat'

interface Props {
  /**
   * Whether to show action buttons
   * @default true
   */
  showActions?: boolean
  /**
   * Chat messages (for modal)
   */
  chatMessages?: ChatMessage[]
  /**
   * Whether chat is loading
   */
  isLoading?: boolean
  /**
   * Show purpose buttons in modal
   */
  showPurposeButtons?: boolean
  /**
   * Selected purpose
   */
  selectedPurpose?: ChatFeature
}

interface Emits {
  (e: 'add'): void
  (e: 'settings'): void
  (e: 'send', message: string): void
  (e: 'purpose-select', purpose: ChatFeature): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
  chatMessages: () => [],
  isLoading: false,
  showPurposeButtons: true,
  selectedPurpose: 'matching',
})

const emit = defineEmits<Emits>()

const route = useRoute()
const chatSetup = useChatSetup()

// Get chat messages from useChat if available
let chatComposable: ReturnType<typeof useChat> | null = null
try {
  chatComposable = useChat()
} catch {
  // useChat not available, use props
}

// Use messages from composable if available, otherwise use props
const finalMessages = computed(() => {
  if (chatComposable && chatComposable.messages.value.length > 0) {
    return [...chatComposable.messages.value]
  }
  return props.chatMessages || []
})

const finalIsLoading = computed(() => {
  if (chatComposable && chatComposable.messages.value.length > 0) {
    return chatComposable.isLoading.value
  }
  return props.isLoading || false
})

// Check if we're on chat page
const isChatPage = computed(() => route.path === '/chat')

// Show modal only when not on chat page and displayMode is 'modal'
const showModal = computed(() => !isChatPage.value && chatSetup.displayMode.value === 'modal')

const isModalOpen = ref(false)

const handleAdd = () => {
  if (showModal.value) {
    // Open modal when not on chat page
    isModalOpen.value = true
  } else {
    // Emit add event when on chat page
    emit('add')
  }
}

const handleModalSend = (message: string) => {
  emit('send', message)
}

const handleModalPurposeSelect = (purpose: ChatFeature) => {
  emit('purpose-select', purpose)
}
</script>

