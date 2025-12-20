<template>
  <div class="h-full container mx-auto">
    <ChatBox
      class="h-full"
      :title="chatTitle"
      :subtitle="chatSubtitle"
      :messages="messages"
      :is-loading="isLoading"
      :show-back="canGoBack"
      :show-results="showResults"
      :show-purpose-buttons="showPurposeButtons"
      :selected-purpose="selectedPurpose"
      :matchings="matchings"
      @send="handleSend"
      @back="handleBack"
      @close="handleClose"
      @stop="handleStop"
      @reload="handleReload"
      @purpose-select="handlePurposeSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { useMatchingChatHandler } from '@chat/composables/use-matching-chat-handler'
import { useMatchingState } from '@matching/composables/use-matching-state'
import { initChatSetup } from '@chat/composables/use-chat-setup'
import type { ChatFeature } from '@chat/types/chat'

const { t } = useI18n()

definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const router = useRouter()

const { messages, isLoading, context, initializeChat, sendMessage, goBack, currentHandler, clearChat } = useChat()
const matchingState = useMatchingState()

// Selected purpose/feature
const selectedPurpose = ref<ChatFeature>('matching')
const showPurposeButtons = ref(true)

// Initialize chat setup with default configuration (only once)
initChatSetup({
  status: 'ready',
  shouldAutoScroll: true,
  shouldScrollToBottom: true,
  autoScroll: true,
  compact: false,
  spacingOffset: 0,
  displayMode: 'modal', // Default is modal
})

// Setup display mode to inline when on chat page
const chatSetup = useChatSetup()
onMounted(() => {
  chatSetup.setDisplayMode('inline')
})

const chatTitle = computed(() => {
  if (context.value?.feature === 'matching') {
    return t('chat.matching.title', { defaultValue: 'Matching Chat' })
  }
  return t('chat.title', { defaultValue: 'Chat' })
})

const chatSubtitle = computed(() => {
  if (context.value?.feature === 'matching') {
    const step = context.value.data?.step || 1
    return t('chat.matching.step', { step, defaultValue: `Bước ${step}/4` })
  }
  return ''
})

const canGoBack = computed(() => {
  if (!currentHandler.value || !context.value) {
    return false
  }
  const currentStep = context.value.data?.step || 1
  return currentHandler.value.canGoBack(currentStep)
})

const showResults = computed(() => {
  return context.value?.feature === 'matching' && context.value.data?.step === 4
})

const matchings = computed(() => {
  return matchingState.matchings.value || []
})

const handleSend = async (message: string) => {
  await sendMessage(message)
}

const handleBack = () => {
  goBack()
}

const handleClose = () => {
  router.push('/dashboard')
}

const handleStop = () => {
  // Stop current operation
  console.log('Stop operation')
}

const handleReload = () => {
  // Reload/regenerate last message
  console.log('Reload operation')
}

const handlePurposeSelect = (purpose: ChatFeature) => {
  selectedPurpose.value = purpose
  
  // Initialize chat with selected purpose
  if (purpose === 'matching') {
    const handler = useMatchingChatHandler()
    initializeChat('matching', handler)
  } else if (purpose === 'create-candidate') {
    // TODO: Implement create-candidate handler
    console.log('Create candidate handler not implemented yet')
  } else if (purpose === 'create-job') {
    // TODO: Implement create-job handler
    console.log('Create job handler not implemented yet')
  } else if (purpose === 'general') {
    // TODO: Implement general handler
    console.log('General handler not implemented yet')
  }
}

// Initialize chat based on route query
onMounted(() => {
  const feature = (route.query.feature as string) || 'matching'
  selectedPurpose.value = feature as ChatFeature

  if (feature === 'matching') {
    const handler = useMatchingChatHandler()
    initializeChat('matching', handler)
  }
  // Add more features here in the future
})
</script>

