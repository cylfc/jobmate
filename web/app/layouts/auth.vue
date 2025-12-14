<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <LayoutsAuthHeader />
    <main class="flex-1 flex items-center justify-center py-12">
      <UContainer class="w-full max-w-md">
        <slot />
      </UContainer>
    </main>
  </div>
</template>

<script setup lang="ts">
// Auth layout for login/register pages
</script>

