<template>
  <div class="flex flex-row justify-center items-center gap-2">
    <u-dropdown-menu
      v-model:open="isOpen"
      :items="menuItems"
      :content="{ side: 'right', align: 'end' }"
      :ui="{ itemLeadingIcon: 'size-4' }"
    >
       <u-button
         variant="outline"
         :icon="isOpen ? 'i-lucide-x' : 'i-lucide-plus'"
         :ui="{
          base: 'ring-brand-100'
         }"
       />
    </u-dropdown-menu>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineOptions({
  name: "PromptChatActions",
});

const isOpen = ref(false);

const menuItems: DropdownMenuItem[][] = [
  [
    {
      label: "Upload File",
      icon: "i-lucide-upload",
      onSelect: () => handleUploadFile(),
    },
    {
      label: "Take a screenshot",
      icon: "i-lucide-camera",
      onSelect: () => handleTakeScreenshot(),
    },
  ],
  [
    {
      label: "Voice Message",
      icon: "i-lucide-mic",
      onSelect: () => handleVoiceMessage(),
    },
    {
      label: "Draw/Annotate",
      icon: "i-lucide-pen-tool",
      onSelect: () => handleDrawAnnotate(),
    },
  ],
  [
    {
      label: "Clear Chat",
      icon: "i-lucide-trash-2",
      color: "error",
      onSelect: () => handleClearChat(),
    },
    {
      label: "Export Chat",
      icon: "i-lucide-download",
      onSelect: () => handleExportChat(),
    },
  ],
];

const handleUploadFile = () => {
  // TODO: Implement file upload logic
  console.log("Upload file clicked");
};

const handleTakeScreenshot = () => {
  // TODO: Implement screenshot logic
  console.log("Take screenshot clicked");
};

const handleVoiceMessage = () => {
  // TODO: Implement voice message logic
  console.log("Voice message clicked");
};

const handleDrawAnnotate = () => {
  // TODO: Implement draw/annotate logic
  console.log("Draw/Annotate clicked");
};

const handleClearChat = () => {
  // TODO: Implement clear chat logic
  console.log("Clear chat clicked");
};

const handleExportChat = () => {
  // TODO: Implement export chat logic
  console.log("Export chat clicked");
};
</script>
