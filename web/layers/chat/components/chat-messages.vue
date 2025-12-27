<template>
  <UChatMessages
    :messages="formattedMessages"
    :status="status"
    :user="user"
    :assistant="assistant"
    :should-auto-scroll="shouldAutoScroll"
    :should-scroll-to-bottom="shouldScrollToBottom"
    :auto-scroll="autoScroll"
    :compact="compact"
    :spacing-offset="spacingOffset"
    :ui="ui"
    class="h-full"
  >
    <!-- Content slot - customize message content rendering -->
    <template #content="{ message }">
      <slot name="content" :message="message">
        <div v-if="hasCustomComponent(message)" class="space-y-2">
          <div v-if="getMessageText(message)" class="text-pretty whitespace-pre-wrap mb-2">
            {{ getMessageText(message) }}
          </div>
          <component
            :is="getComponent(message)"
            v-bind="getComponentProps(message)"
            @update="(data) => handleComponentUpdate(message, data)"
            @clear="() => handleComponentAction(message, 'clear')"
            @back="() => handleComponentAction(message, 'back')"
          />
        </div>
        <div v-else class="text-pretty whitespace-pre-wrap">
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
        :label="$t('chat.components.messages.thinking')"
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
import { getChatComponent } from "@chat/stores/component-registry";

interface Props {
  messages: ChatMessage[];
}

const props = defineProps<Props>();

const {
  status,
  user,
  assistant,
  shouldAutoScroll,
  shouldScrollToBottom,
  autoScroll,
  compact,
  spacingOffset,
  ui,
} = useChatSetup({ syncStatus: true });

const emit = defineEmits<{
  (e: "component-update", messageId: string, data: any): void;
  (e: "component-action", messageId: string, action: string): void;
}>();

const hasCustomComponent = (message: any): boolean => {
  const originalMessage = props.messages.find((m) => m.id === message.id);
  return !!originalMessage?.component;
};

const getMessageText = (message: any): string => {
  return getTextFromMessage(message) || "";
};

const getComponent = (message: any) => {
  const originalMessage = props.messages.find((m) => m.id === message.id);
  if (!originalMessage?.component) return null;

  const entry = getChatComponent(originalMessage.component.type);
  return entry?.component || null;
};

const getComponentProps = (message: any) => {
  const originalMessage = props.messages.find((m) => m.id === message.id);
  if (!originalMessage?.component) return {};

  const entry = getChatComponent(originalMessage.component.type);
  return {
    ...entry?.props,
    ...originalMessage.component.props,
  };
};

const handleComponentUpdate = (message: any, data: any) => {
  emit("component-update", message.id, data);
};

const handleComponentAction = (message: any, action: string) => {
  emit("component-action", message.id, action);
};

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
