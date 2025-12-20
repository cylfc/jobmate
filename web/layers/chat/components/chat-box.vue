<template>
  <UCard class="h-full flex flex-col">
    <div class="flex-1 overflow-hidden flex flex-col">
      <UChatPalette class="h-full flex flex-col" :ui="{
        prompt: 'border-none border-t-0'
      }">
        <ChatMessages :messages="messages" />

        <template #prompt>
          <div class="flex flex-col justify-start items-stretch pt-4 gap-4">
            <!-- Purpose selection buttons -->
            <ChatPurposeSelector
              :show-purpose-buttons="showPurposeButtons"
              :selected-purpose="selectedPurpose"
              @select="handlePurposeSelect"
            />

            <!-- Chat prompt input -->
            <UChatPrompt
              v-model="input"
              :error="error ? new Error(error) : undefined"
              variant="soft"
              @submit="handleSubmit"
            >
              <template #footer>
                <div
                  class="w-full flex flex-row justify-between items-center mt-2"
                >
                  <ChatPromptActions
                    :show-actions="showActions"
                    @add="$emit('add')"
                    @settings="$emit('settings')"
                  />
                  <UChatPromptSubmit
                    :status="chatStatus"
                    @stop="$emit('stop')"
                    @reload="$emit('reload')"
                  />
                </div>
              </template>
            </UChatPrompt>
          </div>
        </template>
      </UChatPalette>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ChatMessage, ChatFeature } from "@chat/types/chat";

interface Props {
  title?: string;
  subtitle?: string;
  messages: ChatMessage[];
  isLoading?: boolean;
  error?: string | null;
  showBack?: boolean;
  showClose?: boolean;
  showActions?: boolean;
  showResults?: boolean;
  showPurposeButtons?: boolean;
  selectedPurpose?: ChatFeature;
  matchings?: any[];
}

interface Emits {
  (e: "send", message: string): void;
  (e: "back"): void;
  (e: "close"): void;
  (e: "stop"): void;
  (e: "reload"): void;
  (e: "add"): void;
  (e: "settings"): void;
  (e: "purpose-select", purpose: ChatFeature): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Chat",
  isLoading: false,
  error: null,
  showBack: false,
  showClose: true,
  showActions: true,
  showResults: false,
  showPurposeButtons: true,
  selectedPurpose: "matching",
  matchings: () => [],
});

const emit = defineEmits<Emits>();

const input = ref("");

// Chat status is now managed by useChatSetup composable inside ChatMessages
// We still need chatStatus for UChatPromptSubmit
const chatStatus = computed(() => {
  if (props.isLoading) {
    return "submitted" as const;
  }
  return "ready" as const;
});

const handleSubmit = (e: Event) => {
  e.preventDefault();
  if (input.value.trim()) {
    emit("send", input.value.trim());
    input.value = "";
  }
};

const handlePurposeSelect = (purpose: ChatFeature) => {
  emit("purpose-select", purpose);
};
</script>

