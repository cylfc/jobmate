<template>
  <UChatMessages
    :messages="formattedMessages"
    :status="chatSetup.status"
    :user="chatSetup.user"
    :assistant="chatSetup.assistant"
    :should-auto-scroll="chatSetup.shouldAutoScroll"
    :should-scroll-to-bottom="chatSetup.shouldScrollToBottom"
    :auto-scroll="chatSetup.autoScroll"
    :compact="chatSetup.compact"
    :spacing-offset="chatSetup.spacingOffset"
    :ui="chatSetup.ui"
    class="flex-1"
  >
    <!-- Content slot - customize message content rendering -->
    <template #content="{ message }">
      <slot name="content" :message="message">
        <div class="text-pretty whitespace-pre-wrap">
          {{ getTextFromMessage(message) }}
        </div>
      </slot>
    </template>

    <!-- Leading slot - customize avatar/icon -->
    <template #leading="slotProps">
      <slot name="leading" v-bind="slotProps" />
    </template>

    <!-- Actions slot - customize message actions -->
    <template #actions="slotProps">
      <slot name="actions" v-bind="slotProps" />
    </template>

    <template #indicator>
      <UButton
        class="px-0"
        color="neutral"
        variant="link"
        loading
        loading-icon="i-lucide-loader"
        label="Thinking..."
      />
    </template>

    <!-- Viewport slot - customize viewport -->
    <template #viewport="slotProps">
      <slot name="viewport" v-bind="slotProps" />
    </template>
  </UChatMessages>
</template>

<script setup lang="ts">
import type { ChatMessage } from "@chat/types/chat";
import { getTextFromMessage } from "@nuxt/ui/utils/ai";

/**
 * Chat Messages Component
 * Renders a list of chat messages using UChatMessages and UChatMessage
 * Compatible with AI SDK v5 message format
 */

interface Props {
  /**
   * Array of chat messages to display
   */
  messages: ChatMessage[];
}

const props = defineProps<Props>();

// Get chat setup configuration from store (read-only)
// Note: init() should be called at page level, not in components
const chatSetup = useChatSetup({ syncStatus: true });

/**
 * Convert ChatMessage[] to AI SDK v5 format for UChatMessages
 */
const formattedMessages = computed(() => {
  return props.messages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant",
    parts: [
      {
        type: "text",
        id: `${msg.id}-text`,
        text: msg.content,
      },
    ],
    createdAt: msg.timestamp,
    metadata: msg.metadata,
  })) as any;
});
</script>
