<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  layout: "dashboard",
});
</script>

<template>
  <LayoutPanel>
    <template #body>
      <div class="flex items-center gap-4">
        <USkeleton class="h-12 w-12 rounded-full" />

        <div class="grid gap-2">
          <USkeleton class="h-4 w-[250px]" />
          <USkeleton class="h-4 w-[200px]" />
        </div>
      </div>
    </template>
    <template #footer>
      <div class="p-2">
        <PromptChat />
      </div>
    </template>
  </LayoutPanel>
</template>
