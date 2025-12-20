import type { ChatFeature, ChatHandler } from '@chat/types/chat'
import { useChatHandlersStore, getHandlerFactory, type ChatHandlerFactory } from '@chat/stores/chat-handlers'
import { useMatchingChatHandler } from '@chat/composables/use-matching-chat-handler'

export const useChatHandlers = () => {
  const store = useChatHandlersStore()

  if (!store.isInitialized) {
    const matchingHandler = useMatchingChatHandler()
    store.registerHandlerFactory('matching', () => matchingHandler)
    store.setHandlerInstance('matching', matchingHandler)
    store.markInitialized()
  }

  const getHandler = (feature: ChatFeature): ChatHandler | null => {
    return store.getHandler(feature)
  }

  const initializeChatWithFeature = (
    feature: ChatFeature,
    initializeChat: (feature: ChatFeature, handler: ChatHandler) => void
  ): boolean => {
    const handler = getHandler(feature)
    if (!handler) {
      console.warn(`No handler found for feature: ${feature}`)
      return false
    }
    initializeChat(feature, handler)
    return true
  }

  const registerHandler = (feature: ChatFeature, factory: ChatHandlerFactory) => {
    store.registerHandlerFactory(feature, factory)
    if (store.isInitialized) {
      try {
        const handler = factory()
        store.setHandlerInstance(feature, handler)
      } catch (error) {
        console.error(`Failed to create handler for feature: ${feature}`, error)
      }
    }
  }

  return {
    getHandler,
    initializeChatWithFeature,
    hasHandler: (feature: ChatFeature) => store.hasHandler(feature),
    getRegisteredFeatures: () => store.registeredFeaturesList,
    registerHandler,
  }
}

export type { ChatHandlerFactory } from '@chat/stores/chat-handlers'

