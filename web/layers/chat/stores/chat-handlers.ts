import { defineStore } from 'pinia'
import type { ChatFeature, ChatHandler } from '@chat/types/chat'

export interface ChatHandlerFactory {
  (): ChatHandler
}

const handlerRegistry = new Map<ChatFeature, ChatHandlerFactory>()
const handlerInstances = new Map<ChatFeature, ChatHandler>()

export const useChatHandlersStore = defineStore('chatHandlers', {
  state: () => ({
    _initialized: false,
    registeredFeatures: [] as ChatFeature[],
  }),

  getters: {
    isInitialized: (state) => state._initialized,

    hasHandler: (state) => (feature: ChatFeature): boolean => {
      return state.registeredFeatures.includes(feature)
    },

    registeredFeaturesList: (state): ChatFeature[] => {
      return [...state.registeredFeatures]
    },
  },

  actions: {
    registerFeature(feature: ChatFeature) {
      if (!this.registeredFeatures.includes(feature)) {
        this.registeredFeatures.push(feature)
      }
    },

    registerHandlerFactory(feature: ChatFeature, factory: ChatHandlerFactory) {
      handlerRegistry.set(feature, factory)
      if (!this.registeredFeatures.includes(feature)) {
        this.registeredFeatures.push(feature)
      }
    },

    getHandler(feature: ChatFeature): ChatHandler | null {
      return handlerInstances.get(feature) || null
    },

    markInitialized() {
      this._initialized = true
    },

    setHandlerInstance(feature: ChatFeature, handler: ChatHandler) {
      handlerInstances.set(feature, handler)
    },

    reset() {
      handlerRegistry.clear()
      handlerInstances.clear()
      this._initialized = false
      this.registeredFeatures = []
    },
  },
})

export const getHandlerFactory = (feature: ChatFeature): ChatHandlerFactory | null => {
  return handlerRegistry.get(feature) || null
}

export const initChatHandlers = () => {
  const store = useChatHandlersStore()
  if (!store.isInitialized) {
    store.registerFeature('matching')
  }
}

