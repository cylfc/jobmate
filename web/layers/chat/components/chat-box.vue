<template>
  <UCard
    class="h-full flex flex-col overflow-hidden"
    :ui="{
      body: mode === 'inline' ? 'h-full max-h-[calc(100dvh-6rem)]' : 'h-full',
    }"
  >
    <UChatPalette
      class="h-full flex flex-col min-h-0"
      :ui="{
        root: 'h-full flex flex-col justify-start items-stretch',
        prompt: 'border-none border-t-0 !pb-0',
      }"
    >
      <div class="flex-1">
        <ChatMessages
          :messages="messages"
          @component-update="handleComponentUpdate"
          @component-action="handleComponentAction"
        />
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
            @select="handlePurposeSelect"
          />

          <UChatPrompt
            v-model="input"
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
import type { ChatFeature } from "@chat/types/chat";
import { useChatSetup } from '@chat/composables/use-chat-setup'

interface Props {
  showPurposeButtons?: boolean;
  stickyFooter?: boolean;
  mode: 'inline' | 'modal';
}

withDefaults(defineProps<Props>(), {
  showPurposeButtons: true,
  stickyFooter: true,
  mode: 'inline',
});

const { selectedPurpose, setSelectedPurpose } = useChatSetup()

// Simple message state (UI only)
const messages = reactive<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; component?: any }>>([])
const isLoading = ref(false)
const input = ref("");

const chatStatus = computed(() => {
  if (isLoading.value) {
    return "submitted" as const;
  }
  return "ready" as const;
});

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  if (input.value.trim()) {
    // Add user message
    messages.push({
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.value.trim(),
      timestamp: new Date(),
    });
    input.value = "";
    // TODO: Handle message processing
  }
};

const handlePurposeSelect = (purpose: ChatFeature) => {
  setSelectedPurpose(purpose);
};

const handleComponentUpdate = (messageId: string, data: any) => {
  // TODO: Handle component update
  console.log('Component update:', messageId, data);
};

const handleComponentAction = (messageId: string, action: string) => {
  // TODO: Handle component action
  console.log('Component action:', messageId, action);
};
</script>
