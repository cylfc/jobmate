/**
 * Use Chat Setup Composable
 * Manages configuration for chat messages component using Pinia store
 */
import { useChatSetupStore } from '@chat/stores/chat-setup'
import type { ChatFeature } from '@chat/types/chat'

export interface ChatSetupConfig {
  /**
   * Status of the chat (submitted, streaming, ready, error)
   * @default 'ready'
   */
  status?: "submitted" | "streaming" | "ready" | "error";
  /**
   * User message configuration
   */
  user?: {
    ui?: string;
    variant?: "soft" | "outline" | "ghost" | "solid";
    icon?: string;
    avatar?: string;
    side?: "left" | "right";
    actions?: any[];
  };
  /**
   * Assistant message configuration
   */
  assistant?: {
    ui?: string;
    variant?: "soft" | "outline" | "ghost" | "solid";
    icon?: string;
    avatar?: string;
    side?: "left" | "right";
    actions?: any[];
  };
  /**
   * Whether to auto-scroll when new messages arrive
   * @default true
   */
  shouldAutoScroll?: boolean;
  /**
   * Whether to scroll to bottom on initial load
   * @default true
   */
  shouldScrollToBottom?: boolean;
  /**
   * Show auto-scroll button when scrolled up
   * @default true
   */
  autoScroll?: boolean | {
    onClick?: () => void;
    [key: string]: any;
  };
  /**
   * Render messages in compact style
   * @default false
   */
  compact?: boolean;
  /**
   * Spacing offset for the last message in px
   * @default 0
   */
  spacingOffset?: number;
  /**
   * UI customization
   */
  ui?: {
    root?: string;
    indicator?: string;
    viewport?: string;
    autoScroll?: string;
  };
  /**
   * Display mode: 'modal' or 'inline'
   * @default 'modal'
   */
  displayMode?: 'modal' | 'inline';
  /**
   * Chat purpose configurations
   */
  purposes?: PurposeConfig[];
}

export interface PurposeConfig {
  value: ChatFeature;
  label: string;
  icon: string;
  i18nKey: string;
}

export interface ChatSetupOptions {
  /**
   * Initial configuration
   */
  initialConfig?: ChatSetupConfig;
  /**
   * Whether to sync status with isLoading from useChat
   * @default true
   */
  syncStatus?: boolean;
}

/**
 * Initialize chat setup with default configuration
 * This should be called once at app startup or in a plugin
 * @param defaultConfig - Default configuration to apply
 */
export const initChatSetup = (defaultConfig?: ChatSetupConfig) => {
  const store = useChatSetupStore();
  store.init(defaultConfig);
};

export const useChatSetup = (options: ChatSetupOptions = {}) => {
  const { syncStatus = true } = options;

  // Get Pinia store
  // Note: This composable only reads data from store
  // To initialize, call initChatSetup() or chatSetup.init() at page level
  const store = useChatSetupStore();

  // Get isLoading from useChat if syncStatus is enabled
  let isLoading = ref(false);
  if (syncStatus) {
    try {
      const chat = useChat();
      isLoading = chat.isLoading;
    } catch {
      // useChat not available, use local ref
      isLoading = ref(false);
    }
  }

  // Computed status that syncs with isLoading if enabled
  const computedStatus = computed(() => {
    if (syncStatus && isLoading.value) {
      return "submitted" as const;
    }
    return store.status;
  });

  /**
   * Update status
   */
  const setStatus = (newStatus: "submitted" | "streaming" | "ready" | "error") => {
    store.setStatus(newStatus);
  };

  /**
   * Update user configuration
   */
  const setUser = (config: ChatSetupConfig["user"]) => {
    store.setUser(config);
  };

  /**
   * Update assistant configuration
   */
  const setAssistant = (config: ChatSetupConfig["assistant"]) => {
    store.setAssistant(config);
  };

  /**
   * Update auto-scroll settings
   */
  const setAutoScroll = (enabled: boolean) => {
    store.setAutoScroll(enabled);
  };

  /**
   * Update should scroll to bottom
   */
  const setShouldScrollToBottom = (enabled: boolean) => {
    store.setShouldScrollToBottom(enabled);
  };

  /**
   * Update auto-scroll button config
   */
  const setAutoScrollButton = (config: boolean | Record<string, any>) => {
    store.setAutoScrollButton(config);
  };

  /**
   * Update compact mode
   */
  const setCompact = (enabled: boolean) => {
    store.setCompact(enabled);
  };

  /**
   * Update spacing offset
   */
  const setSpacingOffset = (offset: number) => {
    store.setSpacingOffset(offset);
  };

    /**
     * Update UI customization
     */
    const setUI = (customUI: ChatSetupConfig["ui"]) => {
      store.setUI(customUI);
    };

    /**
     * Set display mode (modal or inline)
     */
    const setDisplayMode = (mode: "modal" | "inline") => {
      store.setDisplayMode(mode);
    };

    /**
     * Set purposes configuration
     */
    const setPurposes = (purposes: PurposeConfig[]) => {
      store.setPurposes(purposes);
    };

  /**
   * Update entire configuration
   */
  const updateConfig = (config: Partial<ChatSetupConfig>) => {
    store.updateConfig(config);
  };

  /**
   * Reset to default configuration
   */
  const reset = () => {
    store.reset();
  };

  /**
   * Initialize store with default configuration (only once)
   * This is a convenience method that delegates to store.init()
   */
  const init = (defaultConfig?: ChatSetupConfig) => {
    store.init(defaultConfig);
  };

  return {
    // Reactive config values from store (computed for reactivity)
    status: computedStatus,
    user: computed(() => store.user),
    assistant: computed(() => store.assistant),
    shouldAutoScroll: computed(() => store.shouldAutoScroll),
    shouldScrollToBottom: computed(() => store.shouldScrollToBottom),
    autoScroll: computed(() => store.autoScroll),
    compact: computed(() => store.compact),
    spacingOffset: computed(() => store.spacingOffset),
    ui: computed(() => store.ui),
    displayMode: computed(() => store.displayMode),
    isModalOpen: computed(() => store.isModalOpen),
    purposes: computed(() => store.purposes),

    // Methods to update config (delegated to store)
    setStatus,
    setUser,
    setAssistant,
    setAutoScroll,
    setShouldScrollToBottom,
    setAutoScrollButton,
    setCompact,
    setSpacingOffset,
    setUI,
    setDisplayMode,
    setPurposes,
    openModal: () => store.openModal(),
    closeModal: () => store.closeModal(),
    toggleModal: () => store.toggleModal(),
    updateConfig,
    reset,
    init,

    // Direct access to store (for advanced usage)
    store,
  };
};

