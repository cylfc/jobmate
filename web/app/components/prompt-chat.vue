<template>
  <UCard
    :ui="{
      root: 'ring-1 ring-brand-500',
      body: 'p-3 sm:p-3 flex flex-col justify-between items-stretch gap-2',
    }"
  >
    <UTextarea
      :id="'prompt-chat-textarea'"
      :name="'prompt-chat-textarea'"
      :ui="{
        base: 'ring-0 hover:ring-0 focus-visible:ring-0 active:ring-0 p-0 text-base',
      }"
      :rows="2"
      :maxrows="2"
      class="w-full bg-bg-100"
      placeholder="How I can help?"
    />
    <div class="flex flex-row justify-between items-end">
      <PromptChatActions />
      <PromptChatSend />
    </div>
  </UCard>
</template>
