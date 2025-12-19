<template>
  <div class="border-t border-border p-4 bg-default">
    <div class="flex gap-2">
      <div class="flex-1">
        <UTextarea
          v-model="inputText"
          :placeholder="placeholder"
          :rows="3"
          :disabled="disabled"
          class="w-full"
          @keydown.enter.exact.prevent="handleEnter"
          @keydown.enter.shift.exact="handleShiftEnter"
        />
      </div>
      <div class="flex flex-col gap-2">
        <UButton
          color="primary"
          :disabled="!canSend || disabled"
          :loading="loading"
          icon="i-lucide-send"
          @click="handleSend"
        >
          {{ t('chat.send', { defaultValue: 'Gửi' }) }}
        </UButton>
        <UButton
          v-if="showBack"
          color="neutral"
          variant="outline"
          icon="i-lucide-arrow-left"
          :disabled="disabled"
          @click="$emit('back')"
        >
          {{ t('chat.back', { defaultValue: 'Quay lại' }) }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface Props {
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  showBack?: boolean
}

interface Emits {
  (e: 'send', message: string): void
  (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Nhập tin nhắn của bạn...',
  disabled: false,
  loading: false,
  showBack: false,
})

const emit = defineEmits<Emits>()

const inputText = ref('')

const canSend = computed(() => {
  return inputText.value.trim().length > 0 && !props.disabled
})

const handleSend = () => {
  if (canSend.value) {
    emit('send', inputText.value.trim())
    inputText.value = ''
  }
}

const handleEnter = () => {
  if (canSend.value) {
    handleSend()
  }
}

const handleShiftEnter = () => {
  // Allow new line with Shift+Enter
  inputText.value += '\n'
}
</script>

