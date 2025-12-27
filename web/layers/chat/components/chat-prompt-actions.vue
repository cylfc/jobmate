<template>
  <div class="flex items-center gap-2">
    <UButton
      v-if="showActions"
      color="neutral"
      variant="ghost"
      icon="i-lucide-plus"
      square
      size="sm"
      @click="handleAdd"
    />
    <UButton
      v-if="showActions"
      color="neutral"
      variant="ghost"
      icon="i-lucide-settings-2"
      square
      size="sm"
      @click="$emit('settings')"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  /**
   * Whether to show action buttons
   * @default true
   */
  showActions?: boolean
}

interface Emits {
  (e: 'add'): void
  (e: 'settings'): void
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
})

const emit = defineEmits<Emits>()

const route = useRoute()

// Check if we're on chat page
const isChatPage = computed(() => route.path === '/chat')

const handleAdd = () => {
  emit('add')
}
</script>

