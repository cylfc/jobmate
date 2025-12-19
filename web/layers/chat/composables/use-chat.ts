/**
 * Use Chat Composable
 * Main composable for chat functionality
 */
import type { ChatMessage, ChatContext, ChatFeature, ChatHandler } from '@chat/types/chat'

export const useChat = () => {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const context = ref<ChatContext | null>(null)
  const currentHandler = ref<ChatHandler | null>(null)

  /**
   * Initialize chat with a feature
   */
  const initializeChat = (feature: ChatFeature, handler: ChatHandler) => {
    context.value = {
      feature,
      data: {},
    }
    currentHandler.value = handler
    messages.value = [
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: handler.getInitialMessage(),
        timestamp: new Date(),
      },
    ]
  }

  /**
   * Send a message
   */
  const sendMessage = async (content: string) => {
    if (!currentHandler.value || !context.value) {
      return
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    }
    messages.value.push(userMessage)

    // Process message
    isLoading.value = true
    try {
      const response = await currentHandler.value.handleMessage(content, context.value)
      if (response) {
        messages.value.push(response)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date(),
      }
      messages.value.push(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear chat
   */
  const clearChat = () => {
    messages.value = []
    context.value = null
    currentHandler.value = null
  }

  /**
   * Go back to previous step
   */
  const goBack = () => {
    if (!currentHandler.value || !context.value) {
      return
    }

    const currentStep = context.value.data?.step || 1
    if (currentHandler.value.canGoBack(currentStep)) {
      const previousStep = currentStep - 1
      context.value.data = {
        ...context.value.data,
        step: previousStep,
      }
      const stepMessage = currentHandler.value.getStepMessage(previousStep)
      messages.value.push({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: stepMessage,
        timestamp: new Date(),
      })
    }
  }

  return {
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    context: readonly(context),
    currentHandler: readonly(currentHandler),
    initializeChat,
    sendMessage,
    clearChat,
    goBack,
  }
}

