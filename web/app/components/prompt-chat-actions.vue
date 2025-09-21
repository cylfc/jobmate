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
        color="neutral"
        :icon="isOpen ? 'i-lucide-x' : 'i-lucide-plus'"
      />
    </u-dropdown-menu>
    <u-dropdown-menu
      v-model:open="isOpenSettings"
      :items="settingsMenuItems"
      :content="{ side: 'right', align: 'end' }"
      :ui="{ itemLeadingIcon: 'size-4' }"
    >
      <u-button
        variant="outline"
        color="neutral"
        :icon="isOpenSettings ? 'i-lucide-x' : 'i-lucide-settings-2'"
      />
    </u-dropdown-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { DropdownMenuItem } from "@nuxt/ui";

defineOptions({
  name: "PromptChatActions",
});

const isOpen = ref(false);
const isOpenSettings = ref(false);

const menuItems: DropdownMenuItem[][] = [
  [
    {
      label: "Upload File",
      icon: "i-lucide-paperclip",
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

const settingsMenuItems: DropdownMenuItem[][] = [
  [
    {
      label: "Chat Settings",
      icon: "i-lucide-message-square",
      onSelect: () => handleChatSettings(),
    },
    {
      label: "AI Model",
      icon: "i-lucide-brain",
      onSelect: () => handleAIModel(),
    },
  ],
  [
    {
      label: "Theme",
      icon: "i-lucide-palette",
      onSelect: () => handleTheme(),
    },
    {
      label: "Language",
      icon: "i-lucide-globe",
      onSelect: () => handleLanguage(),
    },
  ],
  [
    {
      label: "Keyboard Shortcuts",
      icon: "i-lucide-keyboard",
      onSelect: () => handleKeyboardShortcuts(),
    },
    {
      label: "Help & Support",
      icon: "i-lucide-help-circle",
      onSelect: () => handleHelpSupport(),
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

// Settings menu handlers
const handleChatSettings = () => {
  // TODO: Implement chat settings logic
  console.log("Chat settings clicked");
};

const handleAIModel = () => {
  // TODO: Implement AI model selection logic
  console.log("AI model clicked");
};

const handleTheme = () => {
  // TODO: Implement theme selection logic
  console.log("Theme clicked");
};

const handleLanguage = () => {
  // TODO: Implement language selection logic
  console.log("Language clicked");
};

const handleKeyboardShortcuts = () => {
  // TODO: Implement keyboard shortcuts logic
  console.log("Keyboard shortcuts clicked");
};

const handleHelpSupport = () => {
  // TODO: Implement help & support logic
  console.log("Help & support clicked");
};
</script>
