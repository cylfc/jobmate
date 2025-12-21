import type { ChatFeature, ChatHandler } from '@chat/types/chat'
import { useChatHandlersStore, getHandlerFactory, type ChatHandlerFactory } from '@chat/stores/chat-handlers'
import { useMatchingChatHandler } from '@chat/composables/use-matching-chat-handler'

export const useChatHandlers = () => {
  const store = useChatHandlersStore()

  // Always ensure matching factory is registered
  if (!getHandlerFactory('matching')) {
    try {
      const factory: ChatHandlerFactory = () => {
        return useMatchingChatHandler()
      }
      store.registerHandlerFactory('matching', factory)
    } catch (error) {
      console.error('Error registering matching handler factory:', error)
    }
  }

  if (!store.isInitialized) {
    store.markInitialized()
  }

  const getHandler = (feature: ChatFeature): ChatHandler | null => {
    let handler = store.getHandler(feature)
    
    if (!handler) {
      const factory = getHandlerFactory(feature)
      if (factory) {
        try {
          handler = factory()
          if (handler) {
            store.setHandlerInstance(feature, handler)
          } else {
            console.error(`Factory for feature ${feature} returned null/undefined`)
          }
        } catch (error) {
          console.error(`Failed to create handler for feature: ${feature}`, error)
        }
      } else {
        console.warn(`No factory found for feature: ${feature}. Registered features:`, store.registeredFeaturesList)
      }
    }
    
    return handler
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

