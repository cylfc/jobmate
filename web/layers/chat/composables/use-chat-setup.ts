import { useChatSetupStore } from '@chat/stores/chat-setup'
import type { ChatFeature } from '@chat/types/chat'

export interface ChatSetupConfig {
  status?: "submitted" | "streaming" | "ready" | "error";
  user?: {
    ui?: string;
    variant?: "soft" | "outline" | "ghost" | "solid";
    icon?: string;
    avatar?: string;
    side?: "left" | "right";
    actions?: any[];
  };
  assistant?: {
    ui?: string;
    variant?: "soft" | "outline" | "ghost" | "solid";
    icon?: string;
    avatar?: string;
    side?: "left" | "right";
    actions?: any[];
  };
  shouldAutoScroll?: boolean;
  shouldScrollToBottom?: boolean;
  autoScroll?: boolean | {
    onClick?: () => void;
    [key: string]: any;
  };
  compact?: boolean;
  spacingOffset?: number;
  ui?: {
    root?: string;
    indicator?: string;
    viewport?: string;
    autoScroll?: string;
  };
  displayMode?: 'modal' | 'inline';
  purposes?: PurposeConfig[];
  selectedPurpose?: ChatFeature;
}

export interface PurposeConfig {
  value: ChatFeature;
  label: string;
  icon: string;
  i18nKey: string;
}

export interface ChatSetupOptions {
  initialConfig?: ChatSetupConfig;
  syncStatus?: boolean;
}

export const initChatSetup = (defaultConfig?: ChatSetupConfig) => {
  const store = useChatSetupStore();
  store.init(defaultConfig);
};

export const useChatSetup = (options: ChatSetupOptions = {}) => {
  const { syncStatus = true } = options;
  const store = useChatSetupStore();

  let isLoading = ref(false);
  if (syncStatus) {
    try {
      const chat = useChat();
      isLoading = chat.isLoading;
    } catch {
      isLoading = ref(false);
    }
  }

  const computedStatus = computed(() => {
    if (syncStatus && isLoading.value) {
      return "submitted" as const;
    }
    return store.status;
  });

  const setStatus = (newStatus: "submitted" | "streaming" | "ready" | "error") => {
    store.setStatus(newStatus);
  };

  const setUser = (config: ChatSetupConfig["user"]) => {
    store.setUser(config);
  };

  const setAssistant = (config: ChatSetupConfig["assistant"]) => {
    store.setAssistant(config);
  };

  const setAutoScroll = (enabled: boolean) => {
    store.setAutoScroll(enabled);
  };

  const setShouldScrollToBottom = (enabled: boolean) => {
    store.setShouldScrollToBottom(enabled);
  };

  const setAutoScrollButton = (config: boolean | Record<string, any>) => {
    store.setAutoScrollButton(config);
  };

  const setCompact = (enabled: boolean) => {
    store.setCompact(enabled);
  };

  const setSpacingOffset = (offset: number) => {
    store.setSpacingOffset(offset);
  };

  const setUI = (customUI: ChatSetupConfig["ui"]) => {
    store.setUI(customUI);
  };

  const setDisplayMode = (mode: "modal" | "inline") => {
    store.setDisplayMode(mode);
  };

  const setPurposes = (purposes: PurposeConfig[]) => {
    store.setPurposes(purposes);
  };

  const setSelectedPurpose = (purpose: ChatFeature) => {
    store.setSelectedPurpose(purpose);
  };

  const updateConfig = (config: Partial<ChatSetupConfig>) => {
    store.updateConfig(config);
  };

  const reset = () => {
    store.reset();
  };

  const init = (defaultConfig?: ChatSetupConfig) => {
    store.init(defaultConfig);
  };

  return {
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
    selectedPurpose: computed(() => store.selectedPurpose),
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
    setSelectedPurpose,
    openModal: () => store.openModal(),
    closeModal: () => store.closeModal(),
    toggleModal: () => store.toggleModal(),
    updateConfig,
    reset,
    init,
    store,
  };
};

