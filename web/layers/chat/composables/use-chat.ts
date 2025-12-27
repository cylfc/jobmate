/**
 * Use Chat Composable
 * Main composable for chat functionality
 * Layer 2: Shared composable with createSharedComposable
 */
import { createSharedComposable } from '@vueuse/core'
import type { ChatMessage, ChatContext, ChatFeature, ChatHandler } from '@chat/types/chat'

const _useChat = () => {
  const messages = reactive<ChatMessage[]>([])
  const isLoading = ref(false)
  const context = ref<ChatContext | null>(null)
  const currentHandler = ref<ChatHandler | null>(null)

  /**
   * Initialize chat with a feature
   */
  const initializeChat = (feature: ChatFeature, handler: ChatHandler) => {
    // Clear existing messages first to prevent duplicates
    messages.splice(0, messages.length)
    
    context.value = {
      feature,
      data: { stepIndex: 0 },
    }
    currentHandler.value = handler
    const initialMessage = handler.getInitialMessage()
    
    // Check if handler has script-based initial message
    const script = (handler as any).getScript?.()
    if (script && script.steps && script.steps.length > 0) {
      const firstStep = script.steps[0]
      messages.push({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: firstStep.message,
        timestamp: new Date(),
        component: firstStep.component,
      })
    } else {
      messages.push({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date(),
      })
    }
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
    messages.push(userMessage)

    // Process message
    isLoading.value = true
    try {
      const response = await currentHandler.value.handleMessage(content, context.value)
      if (response) {
        messages.push(response)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
        timestamp: new Date(),
      }
      messages.push(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear chat
   */
  const clearChat = () => {
    messages.splice(0, messages.length)
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
      messages.push({
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: stepMessage,
        timestamp: new Date(),
      })
    }
  }

  /**
   * Handle component update from custom chat components
   */
  const handleComponentUpdate = async (messageId: string, data: any) => {
    if (!currentHandler.value || !context.value) {
      return
    }

    const message = messages.find((m) => m.id === messageId)
    if (!message) {
      return
    }

    // Update context with component data
    context.value.data = {
      ...context.value.data,
      ...data,
    }

    // Process the update through handler
    isLoading.value = true
    try {
      const response = await currentHandler.value.handleComponentUpdate?.(messageId, data, context.value)
      if (response) {
        messages.push(response)
      }
    } catch (error) {
      console.error('Error processing component update:', error)
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Xin lỗi, đã có lỗi xảy ra khi xử lý dữ liệu. Vui lòng thử lại.',
        timestamp: new Date(),
      }
      messages.push(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reset chat state
   */
  const reset = () => {
    messages.splice(0, messages.length)
    isLoading.value = false
    context.value = null
    currentHandler.value = null
  }

  onUnmounted(() => {
    // Optional cleanup
  })

  return {
    messages,
    isLoading,
    context,
    currentHandler,
    initializeChat,
    sendMessage,
    clearChat,
    goBack,
    handleComponentUpdate,
    reset,
  }
}

export const useChat = createSharedComposable(_useChat)

