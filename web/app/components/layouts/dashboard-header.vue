<template>
  <header class="border-b border-default bg-default sticky top-0 z-50 px-4">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center gap-4">
        <NuxtLink to="/dashboard" class="flex items-center gap-2">
          <UIcon name="i-lucide-briefcase" class="w-8 h-8 text-primary" />
          <span class="text-xl font-bold text-default">JobMate</span>
        </NuxtLink>
      </div>
      <LayoutsHeaderActions />
    </div>
  </header>
</template>

<script setup lang="ts">
// Header actions are now handled by LayoutsDashboardHeaderActions component
</script>
