<template>
  <UChatMessages
    :messages="formattedMessages"
    :status="chatSetup.status.value"
    :user="chatSetup.user.value"
    :assistant="chatSetup.assistant.value"
    :should-auto-scroll="chatSetup.shouldAutoScroll.value"
    :should-scroll-to-bottom="chatSetup.shouldScrollToBottom.value"
    :auto-scroll="chatSetup.autoScroll.value"
    :compact="chatSetup.compact.value ?? false"
    :spacing-offset="chatSetup.spacingOffset.value ?? 0"
    :ui="chatSetup.ui.value"
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
import { getChatComponent } from "@chat/stores/component-registry";
import { useChat } from "@chat/composables/use-chat";

interface Props {
  messages: ChatMessage[];
}

const props = defineProps<Props>();

const chatSetup = useChatSetup({ syncStatus: true });
const chat = useChat();

const emit = defineEmits<{
  (e: "component-update", messageId: string, data: any): void;
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
