/**
 * Use Chat State Composable
 * Manages chat UI state and computed values
 * Reduces props drilling by centralizing state logic
 */
import { useChat } from './use-chat'
import { useChatSetup } from './use-chat-setup'

export const useChatState = () => {
  const { t } = useI18n()
  const { messages, context, currentHandler } = useChat()

  /**
   * Get chat title based on current context
   */
  const chatTitle = computed(() => {
    if (context?.feature === 'matching') {
      return t('chat.matching.title', { defaultValue: 'Matching Chat' })
    }
    if (context?.feature === 'create-candidate') {
      return t('chat.create-candidate.title', { defaultValue: 'Tạo ứng viên' })
    }
    if (context?.feature === 'create-job') {
      return t('chat.create-job.title', { defaultValue: 'Tạo JD' })
    }
    if (context?.feature === 'general') {
      return t('chat.general.title', { defaultValue: 'Chat tổng quát' })
    }
    return t('chat.title', { defaultValue: 'Chat' })
  })

  const chatSubtitle = computed(() => {
    if (context?.feature === 'matching') {
      const step = context.data?.step || 1
      const totalSteps = currentHandler?.getTotalSteps() || 4
      return t('chat.matching.step', { step, total: totalSteps, defaultValue: `Bước ${step}/${totalSteps}` })
    }
    return ''
  })

  const canGoBack = computed(() => {
    if (!currentHandler || !context) {
      return false
    }
    const currentStep = context.data?.step || 1
    return currentHandler.canGoBack(currentStep)
  })

  const showResults = computed(() => {
    const feature = context?.feature
    const step = context?.data?.step

    if (feature === 'matching') {
      return step === 4
    }
    return false
  })

  const resultsData = computed(() => {
    const feature = context?.feature
    const metadata = messages[messages.length - 1]?.metadata

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

