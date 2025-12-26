import type { ChatFeature, ChatHandler } from '@chat/types/chat'
import { useChatHandlersStore, getHandlerFactory, type ChatHandlerFactory } from '@chat/stores/chat-handlers'
import { useMatchingChatHandler } from '@chat/composables/use-matching-chat-handler'
import { useCreateCandidateChatHandler } from '@chat/composables/use-create-candidate-chat-handler'
import { useChatSetup } from '@chat/composables/use-chat-setup'
import type { ChatScript } from '@chat/types/script'

export const useChatHandlers = () => {
  const store = useChatHandlersStore()
  const chatSetup = useChatSetup()

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

  // Always ensure create-candidate factory is registered
  if (!getHandlerFactory('create-candidate')) {
    try {
      const factory: ChatHandlerFactory = () => {
        return useCreateCandidateChatHandler()
      }
      store.registerHandlerFactory('create-candidate', factory)
    } catch (error) {
      console.error('Error registering create-candidate handler factory:', error)
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

  // Reactive active handler based on selectedPurpose
  const activeHandler = computed<ChatHandler | null>(() => {
    const selectedPurpose = chatSetup.selectedPurpose.value
    if (!selectedPurpose) {
      return null
    }
    return getHandler(selectedPurpose)
  })

  // Reactive active script based on selectedPurpose
  const activeScript = computed<ChatScript | null>(() => {
    const handler = activeHandler.value
    if (!handler) {
      return null
    }
    // Check if handler has getScript method
    const handlerWithScript = handler as ChatHandler & { getScript?: () => ChatScript }
    if (handlerWithScript.getScript && typeof handlerWithScript.getScript === 'function') {
      try {
        return handlerWithScript.getScript()
      } catch (error) {
        console.error('Error getting script from handler:', error)
        return null
      }
    }
    return null
  })

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
    // Reactive properties
    activeHandler,
    activeScript,
  }
}

export type { ChatHandlerFactory } from '@chat/stores/chat-handlers'

