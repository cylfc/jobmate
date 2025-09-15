<template>
  <div>
    <u-card
      :ui="{
        root: 'ring-1 ring-brand-500 shadow-2xl',
        body: 'p-3 sm:p-3 flex flex-col justify-between items-stretch gap-2',
      }"
    >
      <u-textarea
        :ui="{
          base: 'ring-0 hover:ring-0 focus-visible:ring-0 active:ring-0 p-0 text-base',
        }"
        :maxrows="2"
        class="w-full"
        placeholder="How I can help?"
      />
      <div class="flex flex-row justify-between items-end">
        <prompt-chat-actions />
        <prompt-chat-send />
      </div>
    </u-card>
  </div>
</template>
