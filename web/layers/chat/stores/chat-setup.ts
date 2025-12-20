/**
 * Chat Setup Store
 * Pinia store for managing chat configuration
 */
import { defineStore } from 'pinia'
import type { ChatSetupConfig, PurposeConfig } from '@chat/composables/use-chat-setup'
import type { ChatFeature } from '@chat/types/chat'

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
    
    // Modal state
    isModalOpen: false,

    // Selected purpose/feature
    selectedPurpose: 'matching' as ChatFeature,

    // Chat purposes configuration
    purposes: [
      {
        value: 'matching',
        label: 'Matching',
        icon: 'i-lucide-users',
        i18nKey: 'chat.purpose.matching',
      },
      {
        value: 'create-candidate',
        label: 'Tạo ứng viên',
        icon: 'i-lucide-user-plus',
        i18nKey: 'chat.purpose.create-candidate',
      },
      {
        value: 'create-job',
        label: 'Tạo JD',
        icon: 'i-lucide-briefcase',
        i18nKey: 'chat.purpose.create-job',
      },
      {
        value: 'create-company',
        label: 'Tạo công ty',
        icon: 'i-lucide-building',
        i18nKey: 'chat.purpose.create-company',
      },
      {
        value: 'general',
        label: 'Tổng quát',
        icon: 'i-lucide-message-circle',
        i18nKey: 'chat.purpose.general',
      },
    ] as PurposeConfig[],
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
      purposes: state.purposes,
      selectedPurpose: state.selectedPurpose,
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
     * Open chat modal
     */
    openModal() {
      this.isModalOpen = true
    },

    /**
     * Close chat modal
     */
    closeModal() {
      this.isModalOpen = false
    },

    /**
     * Toggle chat modal
     */
    toggleModal() {
      this.isModalOpen = !this.isModalOpen
    },

    /**
     * Set purposes configuration
     */
    setPurposes(purposes: PurposeConfig[]) {
      this.purposes = purposes
    },

    /**
     * Set selected purpose/feature
     */
    setSelectedPurpose(purpose: ChatFeature) {
      this.selectedPurpose = purpose
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
      if (config.purposes !== undefined) {
        this.purposes = config.purposes
      }
      if (config.selectedPurpose !== undefined) {
        this.selectedPurpose = config.selectedPurpose
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
      this.selectedPurpose = 'matching'
      this.purposes = [
        {
          value: 'matching',
          label: 'Matching',
          icon: 'i-lucide-users',
          i18nKey: 'chat.purpose.matching',
        },
        {
          value: 'create-candidate',
          label: 'Tạo ứng viên',
          icon: 'i-lucide-user-plus',
          i18nKey: 'chat.purpose.create-candidate',
        },
        {
          value: 'create-job',
          label: 'Tạo JD',
          icon: 'i-lucide-briefcase',
          i18nKey: 'chat.purpose.create-job',
        },
        {
          value: 'create-company',
          label: 'Tạo công ty',
          icon: 'i-lucide-building',
          i18nKey: 'chat.purpose.create-company',
        },
        {
          value: 'general',
          label: 'Tổng quát',
          icon: 'i-lucide-message-circle',
          i18nKey: 'chat.purpose.general',
        },
      ]
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

