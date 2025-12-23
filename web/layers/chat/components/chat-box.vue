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
        content: 'max-h-[calc(100vh - 96px)]',
      }"
    >
      <div class="flex-1">
        <ChatMessages
          :messages="[...chat.messages.value]"
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
import { useChatState } from '@chat/composables/use-chat-state'
import { useChat } from '@chat/composables/use-chat'
import { useChatSetup } from '@chat/composables/use-chat-setup'
import { useChatHandlers } from '@chat/composables/use-chat-handlers'
import { useChatComponents } from '@chat/composables/use-chat-components'

const chatComponents = useChatComponents()
chatComponents.registerDefaultComponents()

interface Props {
  showPurposeButtons?: boolean;
  stickyFooter?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showPurposeButtons: true,
  stickyFooter: true,
});

const chat = useChat()
const chatSetup = useChatSetup()
const chatState = useChatState()

const input = ref("");

const chatStatus = computed(() => {
  if (chat.isLoading.value) {
    return "submitted" as const;
  }
  return "ready" as const;
});

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  if (input.value.trim()) {
    await chat.sendMessage(input.value.trim());
    input.value = "";
  }
};

const handlePurposeSelect = (purpose: ChatFeature) => {
  chatSetup.setSelectedPurpose(purpose);
  const chatHandlers = useChatHandlers();
  // Always reinitialize when purpose changes
  chatHandlers.initializeChatWithFeature(purpose, chat.initializeChat);
};

const handleComponentUpdate = (messageId: string, data: any) => {
  chat.handleComponentUpdate(messageId, data);
};

const handleComponentAction = (messageId: string, action: string) => {
  if (action === 'back') {
    // Go back to previous step
    const currentStepIndex = chat.context.value?.data?.stepIndex || 0
    if (currentStepIndex > 0) {
      chat.context.value = {
        ...chat.context.value!,
        data: {
          ...chat.context.value!.data,
          stepIndex: currentStepIndex - 1,
        },
      }
      // Reload the previous step message
      const script = chat.currentHandler.value?.getScript?.()
      if (script && script.steps[currentStepIndex - 1]) {
        const prevStep = script.steps[currentStepIndex - 1]
        chat.messages.value.push({
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: prevStep.message,
          timestamp: new Date(),
          component: prevStep.component,
        })
      }
    }
  } else if (action === 'clear') {
    // Clear current step data - handled by component itself
    // This is mainly for UI feedback
  }
};
</script>
