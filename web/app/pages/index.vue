<script setup lang="ts">
import { definePageMeta } from "#imports";

definePageMeta({
  layout: "dashboard",
});
</script>

<template>
  <LayoutPanel>
    <template #body>
      <LayoutChat />
    </template>
  </LayoutPanel>
</template>
