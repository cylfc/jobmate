/**
 * Use Chat Setup Composable
 * Manages chat UI configuration and setup
 * Layer 2: Shared composable with createSharedComposable
 */
import { createSharedComposable } from '@vueuse/core'
import type { ChatFeature } from '@chat/types/chat'

export interface ChatSetupConfig {
  status?: "submitted" | "streaming" | "ready" | "error";
  user?: {
    ui?: string;
    variant?: "soft" | "outline" | "solid" | "subtle" | "naked";
    icon?: string;
    avatar?: string;
    side?: "left" | "right";
    actions?: any[];
  };
  assistant?: {
    ui?: string;
    variant?: "soft" | "outline" | "solid" | "subtle" | "naked";
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

const defaultPurposes: PurposeConfig[] = [
  {
    value: 'matching',
    label: 'Matching',
    icon: 'i-lucide-users',
    i18nKey: 'chat.purpose.matching',
  },
  {
    value: 'create-candidate',
    label: undefined,
    icon: 'i-lucide-user-plus',
    i18nKey: 'chat.purpose.create-candidate',
  },
  {
    value: 'create-job',
    label: undefined,
    icon: 'i-lucide-briefcase',
    i18nKey: 'chat.purpose.create-job',
  },
  {
    value: 'create-company',
    label: undefined,
    icon: 'i-lucide-building',
    i18nKey: 'chat.purpose.create-company',
  },
  {
    value: 'general',
    label: undefined,
    icon: 'i-lucide-message-circle',
    i18nKey: 'chat.purpose.general',
  },
]

const _useChatSetup = (options: ChatSetupOptions = {}) => {
  const { syncStatus = true } = options;
  
  const status = ref<'submitted' | 'streaming' | 'ready' | 'error'>('ready')
  const shouldAutoScroll = ref(true)
  const shouldScrollToBottom = ref(true)
  const autoScroll = ref<boolean | Record<string, any>>(true)
  const compact = ref(false)
  const spacingOffset = ref(0)
  const user = ref<ChatSetupConfig['user']>(undefined)
  const assistant = reactive<ChatSetupConfig['assistant']>({ variant: 'soft' })
  const ui = ref<ChatSetupConfig['ui']>(undefined)
  const displayMode = ref<'modal' | 'inline'>('modal')
  const purposes = reactive<PurposeConfig[]>([...defaultPurposes])
  const selectedPurpose = ref<ChatFeature>('matching')
  const _initialized = ref(false)
  const isLoading = ref(false)

  const computedStatus = computed(() => {
    if (syncStatus && isLoading.value) {
      return "submitted" as const;
    }
    return status.value;
  });

  const setStatus = (newStatus: "submitted" | "streaming" | "ready" | "error") => {
    status.value = newStatus;
  };

  const setUser = (config: ChatSetupConfig["user"]) => {
    user.value = config;
  };

  const setAssistant = (config: ChatSetupConfig["assistant"]) => {
    if (config) {
      Object.assign(assistant, config);
    } else {
      Object.assign(assistant, { variant: 'soft' });
    }
  };

  const setAutoScroll = (enabled: boolean) => {
    shouldAutoScroll.value = enabled;
  };

  const setShouldScrollToBottom = (enabled: boolean) => {
    shouldScrollToBottom.value = enabled;
  };

  const setAutoScrollButton = (config: boolean | Record<string, any>) => {
    autoScroll.value = config;
  };

  const setCompact = (enabled: boolean) => {
    compact.value = enabled;
  };

  const setSpacingOffset = (offset: number) => {
    spacingOffset.value = offset;
  };

  const setUI = (customUI: ChatSetupConfig["ui"]) => {
    ui.value = customUI;
  };

  const setDisplayMode = (mode: "modal" | "inline") => {
    displayMode.value = mode;
  };

  const setPurposes = (newPurposes: PurposeConfig[]) => {
    purposes.splice(0, purposes.length, ...newPurposes);
  };

  const setSelectedPurpose = (purpose: ChatFeature) => {
    selectedPurpose.value = purpose;
  };

  const updateConfig = (config: Partial<ChatSetupConfig>) => {
    if (config.status !== undefined) {
      status.value = config.status;
    }
    if (config.user !== undefined) {
      user.value = config.user;
    }
    if (config.assistant !== undefined) {
      setAssistant(config.assistant);
    }
    if (config.shouldAutoScroll !== undefined) {
      shouldAutoScroll.value = config.shouldAutoScroll;
    }
    if (config.shouldScrollToBottom !== undefined) {
      shouldScrollToBottom.value = config.shouldScrollToBottom;
    }
    if (config.autoScroll !== undefined) {
      autoScroll.value = config.autoScroll;
    }
    if (config.compact !== undefined) {
      compact.value = config.compact;
    }
    if (config.spacingOffset !== undefined) {
      spacingOffset.value = config.spacingOffset;
    }
    if (config.ui !== undefined) {
      ui.value = config.ui;
    }
    if (config.displayMode !== undefined) {
      displayMode.value = config.displayMode;
    }
    if (config.purposes !== undefined) {
      setPurposes(config.purposes);
    }
    if (config.selectedPurpose !== undefined) {
      selectedPurpose.value = config.selectedPurpose;
    }
  };

  const reset = () => {
    status.value = 'ready';
    shouldAutoScroll.value = true;
    shouldScrollToBottom.value = true;
    autoScroll.value = true;
    compact.value = false;
    spacingOffset.value = 0;
    user.value = undefined;
    Object.assign(assistant, { variant: 'soft' });
    ui.value = undefined;
    displayMode.value = 'modal';
    purposes.splice(0, purposes.length, ...defaultPurposes);
    selectedPurpose.value = 'matching';
  };

  const init = (defaultConfig?: ChatSetupConfig) => {
    if (_initialized.value) {
      return;
    }
    _initialized.value = true;
    
    if (defaultConfig) {
      updateConfig(defaultConfig);
    }
  };

  onUnmounted(() => {
    // Optional cleanup
  });

  return {
    status: computedStatus,
    user,
    assistant,
    shouldAutoScroll,
    shouldScrollToBottom,
    autoScroll,
    compact,
    spacingOffset,
    ui,
    displayMode,
    purposes,
    selectedPurpose,
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
    updateConfig,
    reset,
    init,
  };
};

export const useChatSetup = createSharedComposable(_useChatSetup)

export const initChatSetup = (defaultConfig?: ChatSetupConfig) => {
  const setup = useChatSetup();
  setup.init(defaultConfig);
};

