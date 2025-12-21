import { defineStore } from 'pinia'
import type { Component } from 'vue'

export interface ComponentRegistryEntry {
  component: Component
  props?: Record<string, any>
}

const componentRegistry = new Map<string, ComponentRegistryEntry>()

export const useComponentRegistryStore = defineStore('componentRegistry', {
  state: () => ({
    _initialized: false,
  }),

  getters: {
    isInitialized: (state) => state._initialized,
  },

  actions: {
    register(type: string, component: Component, defaultProps?: Record<string, any>) {
      componentRegistry.set(type, {
        component,
        props: defaultProps,
      })
    },

    get(type: string): ComponentRegistryEntry | null {
      return componentRegistry.get(type) || null
    },

    has(type: string): boolean {
      return componentRegistry.has(type)
    },

    getAllTypes(): string[] {
      return Array.from(componentRegistry.keys())
    },

    reset() {
      componentRegistry.clear()
      this._initialized = false
    },
  },
})

export const registerChatComponent = (
  type: string,
  component: Component,
  defaultProps?: Record<string, any>
) => {
  const store = useComponentRegistryStore()
  store.register(type, component, defaultProps)
}

export const getChatComponent = (type: string): ComponentRegistryEntry | null => {
  const store = useComponentRegistryStore()
  return store.get(type)
}

