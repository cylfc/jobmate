/**
 * Chat Setup Store
 * Pinia store for managing chat configuration
 */
import { defineStore } from 'pinia'
import type { ChatSetupConfig } from '@chat/composables/use-chat-setup'

export const useChatSetupStore = defineStore('chatSetup', {
  state: () => ({
    // Track if store has been initialized
    _initialized: false,
    
    // Status configuration
    status: 'ready' as 'submitted' | 'streaming' | 'ready' | 'error',
    
    // Auto-scroll settings
    shouldAutoScroll: true,
    shouldScrollToBottom: true,
    autoScroll: true as boolean | Record<string, any>,
    
    // Display settings
    compact: false,
    spacingOffset: 0,
    
    // User and Assistant configurations
    user: undefined as ChatSetupConfig['user'],
    assistant: undefined as ChatSetupConfig['assistant'],
    
    // UI customization
    ui: undefined as ChatSetupConfig['ui'],
    
    // Display mode: 'modal' or 'inline'
    displayMode: 'modal' as 'modal' | 'inline',
  }),

  getters: {
    /**
     * Check if store has been initialized
     */
    isInitialized: (state) => state._initialized,
    
    /**
     * Get current status
     */
    currentStatus: (state) => state.status,
    
    /**
     * Get user configuration
     */
    userConfig: (state) => state.user,
    
    /**
     * Get assistant configuration
     */
    assistantConfig: (state) => state.assistant,
    
    /**
     * Get all configuration as an object
     */
    config: (state): ChatSetupConfig => ({
      status: state.status,
      user: state.user,
      assistant: state.assistant,
      shouldAutoScroll: state.shouldAutoScroll,
      shouldScrollToBottom: state.shouldScrollToBottom,
      autoScroll: state.autoScroll,
      compact: state.compact,
      spacingOffset: state.spacingOffset,
      ui: state.ui,
      displayMode: state.displayMode,
    }),
  },

  actions: {
    /**
     * Update status
     */
    setStatus(newStatus: 'submitted' | 'streaming' | 'ready' | 'error') {
      this.status = newStatus
    },

    /**
     * Update user configuration
     */
    setUser(config: ChatSetupConfig['user']) {
      this.user = config
    },

    /**
     * Update assistant configuration
     */
    setAssistant(config: ChatSetupConfig['assistant']) {
      this.assistant = config
    },

    /**
     * Update auto-scroll settings
     */
    setAutoScroll(enabled: boolean) {
      this.shouldAutoScroll = enabled
    },

    /**
     * Update should scroll to bottom
     */
    setShouldScrollToBottom(enabled: boolean) {
      this.shouldScrollToBottom = enabled
    },

    /**
     * Update auto-scroll button config
     */
    setAutoScrollButton(config: boolean | Record<string, any>) {
      this.autoScroll = config
    },

    /**
     * Update compact mode
     */
    setCompact(enabled: boolean) {
      this.compact = enabled
    },

    /**
     * Update spacing offset
     */
    setSpacingOffset(offset: number) {
      this.spacingOffset = offset
    },

    /**
     * Update UI customization
     */
    setUI(customUI: ChatSetupConfig['ui']) {
      this.ui = customUI
    },

    /**
     * Set display mode (modal or inline)
     */
    setDisplayMode(mode: 'modal' | 'inline') {
      this.displayMode = mode
    },

    /**
     * Update entire configuration
     */
    updateConfig(config: Partial<ChatSetupConfig>) {
      if (config.status !== undefined) {
        this.status = config.status
      }
      if (config.user !== undefined) {
        this.user = config.user
      }
      if (config.assistant !== undefined) {
        this.assistant = config.assistant
      }
      if (config.shouldAutoScroll !== undefined) {
        this.shouldAutoScroll = config.shouldAutoScroll
      }
      if (config.shouldScrollToBottom !== undefined) {
        this.shouldScrollToBottom = config.shouldScrollToBottom
      }
      if (config.autoScroll !== undefined) {
        this.autoScroll = config.autoScroll
      }
      if (config.compact !== undefined) {
        this.compact = config.compact
      }
      if (config.spacingOffset !== undefined) {
        this.spacingOffset = config.spacingOffset
      }
      if (config.ui !== undefined) {
        this.ui = config.ui
      }
      if (config.displayMode !== undefined) {
        this.displayMode = config.displayMode
      }
    },

    /**
     * Reset to default configuration
     */
    reset() {
      this.status = 'ready'
      this.shouldAutoScroll = true
      this.shouldScrollToBottom = true
      this.autoScroll = true
      this.compact = false
      this.spacingOffset = 0
      this.user = undefined
      this.assistant = undefined
      this.ui = undefined
      this.displayMode = 'modal'
    },

    /**
     * Initialize with default or provided configuration
     */
    initialize(initialConfig?: ChatSetupConfig) {
      if (initialConfig) {
        this.updateConfig(initialConfig)
      }
    },

    /**
     * Initialize store with default configuration (only once)
     * This should be called once at app startup
     */
    init(defaultConfig?: ChatSetupConfig) {
      if (this._initialized) {
        // Already initialized, skip
        return
      }

      // Set initialized flag
      this._initialized = true

      // Apply default config if provided, otherwise use store defaults
      if (defaultConfig) {
        this.updateConfig(defaultConfig)
      }
    },
  },
})

