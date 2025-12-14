<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <LayoutsDashboardHeader />
    <div class="flex flex-1 overflow-hidden">
      <LayoutsDashboardSidebar />
      <main class="flex-1 overflow-y-auto">
        <div class="p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Dashboard layout for authenticated pages
</script>
