<template>
  <div class="flex flex-row justify-between items-center gap-2">
    <!-- Model Selection Dropdown -->
    <u-dropdown-menu
      :items="modelMenuItems"
      :content="{ side: 'top', align: 'start' }"
      :ui="{ itemLeadingIcon: 'size-4' }"
    >
      <u-button
        variant="ghost"
        color="neutral"
        :label="`${selectedModel.label}`"
        trailing-icon="i-lucide-chevron-down"
        :ui="{
          base: 'ring-brand-100',
          trailingIcon: 'size-4',
        }"
      />
    </u-dropdown-menu>

    <!-- Send Button -->
    <u-button
      variant="solid"
      icon="i-lucide-arrow-up"
      class="text-center justify-center items-center"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { DropdownMenuItem } from "@nuxt/ui";

defineOptions({
  name: "PromptChatSend",
});

// Model selection state
const selectedModel = ref({
  label: "GPT-4",
  icon: "i-lucide-brain",
  value: "gpt-4",
});

// Available models
const modelMenuItems: DropdownMenuItem[][] = [
  [
    {
      label: "GPT-4",
      icon: "i-lucide-brain",
      onSelect: () => selectModel("gpt-4", "GPT-4", "i-lucide-brain"),
    },
    {
      label: "GPT-3.5 Turbo",
      icon: "i-lucide-zap",
      onSelect: () =>
        selectModel("gpt-3.5-turbo", "GPT-3.5 Turbo", "i-lucide-zap"),
    },
  ],
  [
    {
      label: "Claude 3 Opus",
      icon: "i-lucide-sparkles",
      onSelect: () =>
        selectModel("claude-3-opus", "Claude 3 Opus", "i-lucide-sparkles"),
    },
    {
      label: "Claude 3 Sonnet",
      icon: "i-lucide-crown",
      onSelect: () =>
        selectModel("claude-3-sonnet", "Claude 3 Sonnet", "i-lucide-crown"),
    },
  ],
  [
    {
      label: "Gemini Pro",
      icon: "i-lucide-gem",
      onSelect: () => selectModel("gemini-pro", "Gemini Pro", "i-lucide-gem"),
    },
  ],
];

// Model selection handler
const selectModel = (value: string, label: string, icon: string) => {
  selectedModel.value = { label, icon, value };
  console.log(`Selected model: ${label} (${value})`);
  // TODO: Emit event or update global state
};
</script>
