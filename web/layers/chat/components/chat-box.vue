<template>
  <UCard
    class="h-full flex flex-col overflow-hidden"
    :ui="{
      body: 'h-full',
    }"
  >
    <UChatPalette
      class="h-full flex flex-col min-h-0"
      :ui="{
        root: 'h-full flex flex-col justify-start items-stretch',
        prompt: 'border-none border-t-0',
        content: 'max-h-[60vh]',
      }"
    >
      <div class="flex-1">
        <ChatMessages :messages="messages" />
      </div>

      <template #prompt>
        <div
          :class="[
            'flex flex-col justify-start items-stretch pt-4 gap-4',
            stickyFooter
              ? 'sticky bottom-0 bg-default z-10 border-t border-gray-200 dark:border-gray-700 pb-4'
              : '',
          ]"
        >
          <ChatPurposeSelector
            :show-purpose-buttons="showPurposeButtons"
            :selected-purpose="chatSetup.selectedPurpose.value"
            @select="handlePurposeSelect"
          />

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
                  :show-actions="true"
                />
                <UChatPromptSubmit
                  :status="chatStatus"
                />
              </div>
            </template>
          </UChatPrompt>
        </div>
      </template>
    </UChatPalette>
  </UCard>
</template>

<script setup lang="ts">
import type { ChatMessage, ChatFeature } from "@chat/types/chat";
import { useChatState } from '@chat/composables/use-chat-state'
import { useChat } from '@chat/composables/use-chat'
import { useChatSetup } from '@chat/composables/use-chat-setup'

interface Props {
  messages: ChatMessage[];
  isLoading?: boolean;
  error?: string | null;
  showPurposeButtons?: boolean;
  stickyFooter?: boolean;
}

interface Emits {
  (e: "send", message: string): void;
  (e: "purpose-select", purpose: ChatFeature): void;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  showPurposeButtons: true,
  stickyFooter: true,
});

const emit = defineEmits<Emits>();

const chat = useChat()
const chatSetup = useChatSetup()
const chatState = useChatState()

const input = ref("");

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
