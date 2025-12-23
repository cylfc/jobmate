<template>
  <div class="space-y-4">
    <p class="text-sm text-muted mb-4">
      {{ message || 'Chọn phương thức nhập liệu:' }}
    </p>

    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="method in methods"
        :key="method.value"
        :color="selectedMethod === method.value ? 'neutral' : 'neutral'"
        :variant="selectedMethod === method.value ? 'soft' : 'outline'"
        :icon="method.icon"
        @click="handleSelectMethod(method.value)"
      >
        {{ method.label }}
      </UButton>
    </div>

    <div v-if="selectedMethod && selectedMethod !== 'prompt'" class="mt-4">
      <component
        :is="getMethodComponent(selectedMethod)"
        v-if="getMethodComponent(selectedMethod)"
        v-bind="getMethodProps(selectedMethod)"
        @update="handleMethodUpdate"
      />
    </div>
    <div v-else-if="selectedMethod === 'prompt'" class="mt-4 p-4 bg-muted rounded-lg">
      <p class="text-sm text-muted">
        Vui lòng nhập thông tin vào ô chat phía dưới và nhấn Enter.
      </p>
    </div>

    <!-- Step action buttons -->
    <StepActionButtons
      :show-clear="selectedMethod === 'upload'"
      :show-back="showBack"
      @clear="handleClear"
      @back="handleBack"
    />
  </div>
</template>

<script setup lang="ts">
import { getChatComponent } from '@chat/stores/component-registry'
import StepActionButtons from './step-action-buttons.vue'

interface Props {
  message?: string
  methods?: Array<{
    value: string
    label: string
    icon: string
  }>
  defaultMethod?: string
  type?: 'job' | 'candidate'
  accept?: string
  multiple?: boolean
  showBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Chọn phương thức nhập liệu:',
  methods: () => [
    { value: 'prompt', label: 'Nhập text', icon: 'i-lucide-pencil' },
    { value: 'source', label: 'Chọn từ database', icon: 'i-lucide-database' },
    { value: 'upload', label: 'Upload file', icon: 'i-lucide-file-up' },
  ],
  defaultMethod: undefined,
  showBack: true,
})

const emit = defineEmits<{
  (e: 'update', data: { method: string; data?: any }): void
  (e: 'clear'): void
  (e: 'back'): void
}>()

const selectedMethod = ref(props.defaultMethod || '')
const uploadComponentRef = ref<any>(null)

const handleSelectMethod = (method: string) => {
  selectedMethod.value = method
  emit('update', { method })
}

const getMethodComponent = (method: string) => {
  switch (method) {
    case 'prompt':
      return null
    case 'source':
      return getChatComponent('source-table')?.component || null
    case 'upload':
      return getChatComponent('upload-handler')?.component || null
    default:
      return null
  }
}

const getMethodProps = (method: string) => {
  switch (method) {
    case 'source':
      return { type: props.type || 'job' }
    case 'upload':
      return {
        accept: props.accept || '.pdf,.doc,.docx,.txt',
        multiple: props.multiple || false,
      }
    default:
      return {}
  }
}

const handleMethodUpdate = (data: any) => {
  // If method component emits update, forward it with method info
  emit('update', { method: selectedMethod.value, data })
}

const handleClear = () => {
  if (selectedMethod.value === 'upload' && uploadComponentRef.value) {
    uploadComponentRef.value.clearFiles?.()
  }
  emit('clear')
}

const handleBack = () => {
  emit('back')
}
</script>

