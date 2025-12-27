<template>
  <UModal
    :ui="{
      content: 'w-full max-w-2xl p-0',
      body: 'sm:p-0 p-0',
    }"
  >
    <template #title>
      {{ t("chat.title", { defaultValue: "Chat" }) }}
    </template>

    <template #description>
      <span class="sr-only">{{ t("chat.description", { defaultValue: "Chat assistant" }) }}</span>
    </template>

    <div class="fixed bottom-4 right-4 z-50">
      <UButton
        color="primary"
        size="xl"
        icon="i-lucide-message-circle"
        class="shadow-lg hover:shadow-xl transition-all duration-300 rounded-full p-4"
      >
        <span class="sr-only">{{
          t("chat.open", { defaultValue: "Mở chat" })
        }}</span>

        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-error rounded-full"
        >
          {{ unreadCount > 9 ? "9+" : unreadCount }}
        </span>
      </UButton>
    </div>

    <template #body>
      <div class="flex flex-col">
        <ChatBox
          class="h-full flex flex-col !border-0 !ring-0"
          :show-purpose-buttons="true"
          :sticky-footer="true"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useChatHandlers } from "@chat/composables/use-chat-handlers";

interface Props {
  feature?: string;
  unreadCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  feature: "matching",
  unreadCount: 0,
});

const { t } = useI18n();
const route = useRoute();

const { displayMode, selectedPurpose } = useChatSetup();
const { initializeChatWithFeature } = useChatHandlers();
const { messages, context, initializeChat } = useChat();

const isChatPage = computed(() => route.path === "/chat");
const shouldShow = computed(
  () => !isChatPage.value && displayMode.value === "modal"
);

const isModalOpen = ref(false);

// Initialize chat when modal opens or when purpose changes
const initializeChatIfNeeded = () => {
  const purpose = selectedPurpose.value;
  // Only initialize if messages are empty or feature changed
  if (messages.length === 0 || 
      (context.value && context.value.feature !== purpose)) {
    const success = initializeChatWithFeature(
      purpose,
      initializeChat
    );
    if (!success) {
      console.error(`Failed to initialize chat with feature: ${purpose}`);
    }
  }
};

watch(isModalOpen, (open) => {
  if (open) {
    initializeChatIfNeeded();
  }
});

// Also watch for purpose changes to reinitialize if needed
watch(() => selectedPurpose.value, () => {
  if (isModalOpen.value) {
    initializeChatIfNeeded();
  }
});
</script>
