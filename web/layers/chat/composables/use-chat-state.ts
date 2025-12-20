/**
 * Use Chat State Composable
 * Manages chat UI state and computed values
 * Reduces props drilling by centralizing state logic
 */
import { useChat } from './use-chat'
import { useChatSetup } from './use-chat-setup'

export const useChatState = () => {
  const { t } = useI18n()
  const chat = useChat()
  const chatSetup = useChatSetup()

  /**
   * Get chat title based on current context
   */
  const chatTitle = computed(() => {
    if (chat.context.value?.feature === 'matching') {
      return t('chat.matching.title', { defaultValue: 'Matching Chat' })
    }
    if (chat.context.value?.feature === 'create-candidate') {
      return t('chat.create-candidate.title', { defaultValue: 'Tạo ứng viên' })
    }
    if (chat.context.value?.feature === 'create-job') {
      return t('chat.create-job.title', { defaultValue: 'Tạo JD' })
    }
    if (chat.context.value?.feature === 'general') {
      return t('chat.general.title', { defaultValue: 'Chat tổng quát' })
    }
    return t('chat.title', { defaultValue: 'Chat' })
  })

  const chatSubtitle = computed(() => {
    if (chat.context.value?.feature === 'matching') {
      const step = chat.context.value.data?.step || 1
      const totalSteps = chat.currentHandler.value?.getTotalSteps() || 4
      return t('chat.matching.step', { step, total: totalSteps, defaultValue: `Bước ${step}/${totalSteps}` })
    }
    return ''
  })

  const canGoBack = computed(() => {
    if (!chat.currentHandler.value || !chat.context.value) {
      return false
    }
    const currentStep = chat.context.value.data?.step || 1
    return chat.currentHandler.value.canGoBack(currentStep)
  })

  const showResults = computed(() => {
    const feature = chat.context.value?.feature
    const step = chat.context.value?.data?.step

    if (feature === 'matching') {
      return step === 4
    }
    return false
  })

  const resultsData = computed(() => {
    const feature = chat.context.value?.feature
    const metadata = chat.messages.value[chat.messages.value.length - 1]?.metadata

    if (feature === 'matching' && metadata?.matchings) {
      return { matchings: metadata.matchings }
    }
    return null
  })

  return {
    chatTitle,
    chatSubtitle,
    canGoBack,
    showResults,
    resultsData,
  }
}

