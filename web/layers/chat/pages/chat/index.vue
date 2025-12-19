<template>
  <div class="container mx-auto h-[calc(100vh-8rem)]">
    <div class="bg-default rounded-lg shadow-sm h-full">
      <ChatContainer
        :title="chatTitle"
        :subtitle="chatSubtitle"
        :messages="messages"
        :is-loading="isLoading"
        :show-back="canGoBack"
        @send="handleSend"
        @back="handleBack"
        @close="handleClose"
      />

      <!-- Results display for matching -->
      <div v-if="showResults" class="border-t border-border p-6 bg-default">
        <div class="mb-4">
          <h3 class="text-lg font-semibold mb-2">
            {{ t('chat.matching.results', { defaultValue: 'Kết quả so khớp' }) }}
          </h3>
        </div>
        <TablesMatchingResultsTable
          v-if="matchings.length > 0"
          :matchings="matchings"
        />
        <div v-else class="text-center text-muted py-8">
          {{ t('chat.matching.no-results', { defaultValue: 'Chưa có kết quả' }) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMatchingChatHandler } from '@chat/composables/use-matching-chat-handler'
import { useMatchingState } from '@matching/composables/use-matching-state'

const { t } = useI18n()

definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const router = useRouter()

const { messages, isLoading, context, initializeChat, sendMessage, goBack, currentHandler } = useChat()
const matchingState = useMatchingState()

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

// Initialize chat based on route query
onMounted(() => {
  const feature = (route.query.feature as string) || 'matching'

  if (feature === 'matching') {
    const handler = useMatchingChatHandler()
    initializeChat('matching', handler)
  }
  // Add more features here in the future
})
</script>

