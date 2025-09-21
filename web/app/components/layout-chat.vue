<script setup lang="ts">
import { ref } from "#imports";
import { Chat } from "@ai-sdk/vue";
import { getTextFromMessage } from "@nuxt/ui/utils/ai";

const input = ref("");

const chat = new Chat({
  onError(error) {
    console.error("Chat error:", error);
  },
});

const handleSubmit = (e: Event) => {
  e.preventDefault();
  chat.sendMessage({ text: input.value });
  input.value = "";
};
</script>
<template>
  <UChatPalette>
    <UChatMessages :messages="chat.messages" :status="chat.status">
      <template #content="{ message }">
        <MDC
          :value="getTextFromMessage(message)"
          :cache-key="message.id"
          unwrap="p"
        />
      </template>
    </UChatMessages>

    <template #prompt>
      <div class="p-2">
        <UChatPrompt
          v-model="input"
          :error="chat.error"
          variant="soft"
          @submit="handleSubmit"
        >
          <template #footer>
            <div class="w-full flex flex-row justify-between items-center">
              <PromptChatActions />
              <UChatPromptSubmit
                :status="chat.status"
                @stop="chat.stop"
                @reload="chat.regenerate"
              />
            </div>
          </template>
        </UChatPrompt>
      </div>
    </template>
  </UChatPalette>
</template>
