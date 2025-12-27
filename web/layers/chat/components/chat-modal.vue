<template>
  <UModal
    :ui="{
      content: 'w-full max-w-2xl p-0 max-h-[80dvh]',
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
          mode="modal"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useChatSetup } from '@chat/composables/use-chat-setup'

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
const { displayMode } = useChatSetup();

const isChatPage = computed(() => route.path === "/chat");
const shouldShow = computed(
  () => !isChatPage.value && displayMode.value === "modal"
);

const isModalOpen = ref(false);
</script>
