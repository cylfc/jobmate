<template>
  <NuxtLink :to="to" class="flex items-center gap-2">
    <UIcon name="i-lucide-drama" class="w-10 h-10 text-primary" />
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  to?: string
}

withDefaults(defineProps<Props>(), {
  to: '/',
})
</script>

