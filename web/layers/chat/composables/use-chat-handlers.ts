/**
 * Use Chat Handlers Composable
 * Manages chat handler registry and instances
 * Layer 2: Shared composable with createSharedComposable
 */
import { createSharedComposable } from '@vueuse/core'
import type { ChatFeature, ChatHandler } from '@chat/types/chat'
import { useMatchingChatHandler } from '@chat/composables/use-matching-chat-handler'

export interface ChatHandlerFactory {
  (): ChatHandler
}

const _useChatHandlers = () => {
  const handlerRegistry = reactive<Map<ChatFeature, ChatHandlerFactory>>(new Map())
  const handlerInstances = reactive<Map<ChatFeature, ChatHandler>>(new Map())
  const registeredFeatures = reactive<ChatFeature[]>([])
  const isInitialized = ref(false)

  // Always ensure matching factory is registered
  const ensureMatchingFactory = () => {
    if (!handlerRegistry.has('matching')) {
      try {
        const factory: ChatHandlerFactory = () => {
          return useMatchingChatHandler()
        }
        registerHandlerFactory('matching', factory)
      } catch (error) {
        console.error('Error registering matching handler factory:', error)
      }
    }
  }

  const registerHandlerFactory = (feature: ChatFeature, factory: ChatHandlerFactory) => {
    handlerRegistry.set(feature, factory)
    if (!registeredFeatures.includes(feature)) {
      registeredFeatures.push(feature)
    }
  }

  const getHandlerFactory = (feature: ChatFeature): ChatHandlerFactory | null => {
    return handlerRegistry.get(feature) || null
  }

  const getHandler = (feature: ChatFeature): ChatHandler | null => {
    let handler = handlerInstances.get(feature) || null
    
    if (!handler) {
      const factory = getHandlerFactory(feature)
      if (factory) {
        try {
          handler = factory()
          if (handler) {
            handlerInstances.set(feature, handler)
          } else {
            console.error(`Factory for feature ${feature} returned null/undefined`)
          }
        } catch (error) {
          console.error(`Failed to create handler for feature: ${feature}`, error)
        }
      } else {
        console.warn(`No factory found for feature: ${feature}. Registered features:`, [...registeredFeatures])
      }
    }
    
    return handler
  }

  const hasHandler = (feature: ChatFeature): boolean => {
    return registeredFeatures.includes(feature)
  }

  const getRegisteredFeatures = (): ChatFeature[] => {
    return [...registeredFeatures]
  }

  const initializeChatWithFeature = (
    feature: ChatFeature,
    initializeChat: (feature: ChatFeature, handler: ChatHandler) => void
  ): boolean => {
    ensureMatchingFactory()
    
    if (!isInitialized.value) {
      isInitialized.value = true
    }

    const handler = getHandler(feature)
    if (!handler) {
      console.warn(`No handler found for feature: ${feature}`)
      return false
    }
    initializeChat(feature, handler)
    return true
  }

  const registerHandler = (feature: ChatFeature, factory: ChatHandlerFactory) => {
    registerHandlerFactory(feature, factory)
    if (isInitialized.value) {
      try {
        const handler = factory()
        handlerInstances.set(feature, handler)
      } catch (error) {
        console.error(`Failed to create handler for feature: ${feature}`, error)
      }
    }
  }

  const reset = () => {
    handlerRegistry.clear()
    handlerInstances.clear()
    registeredFeatures.splice(0, registeredFeatures.length)
    isInitialized.value = false
  }

  onUnmounted(() => {
    // Optional cleanup
  })

  // Initialize on first use
  ensureMatchingFactory()

  return {
    handlerRegistry,
    handlerInstances,
    registeredFeatures,
    isInitialized,
    getHandler,
    getHandlerFactory,
    hasHandler,
    getRegisteredFeatures,
    initializeChatWithFeature,
    registerHandler,
    registerHandlerFactory,
    reset,
  }
}

export const useChatHandlers = createSharedComposable(_useChatHandlers)

