<template>
  <div class="flex items-center justify-end gap-2 pt-2 border-t border-muted">
    <div class="flex gap-2">
      <UButton
        v-if="showClear"
        variant="soft"
        color="neutral"
        size="sm"
        icon="i-lucide-x"
        square
        @click="handleClear"
      />
    </div>
    <div class="flex gap-2">
      <UButton
        v-if="showBack"
        variant="soft"
        color="neutral"
        size="sm"
        icon="i-lucide-corner-up-left"
        square
        @click="handleBack"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showClear?: boolean
  showBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showClear: true,
  showBack: true,
})

const emit = defineEmits<{
  (e: 'clear'): void
  (e: 'back'): void
}>()

const handleClear = () => {
  emit('clear')
}

const handleBack = () => {
  emit('back')
}
</script>

