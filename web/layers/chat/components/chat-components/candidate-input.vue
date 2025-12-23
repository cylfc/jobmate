<template>
  <div class="space-y-4">
    <UFormField label="Nhập thông tin ứng viên">
      <UTextarea
        v-model="candidateText"
        placeholder="Dán thông tin ứng viên hoặc upload CV..."
        :rows="8"
      />
    </UFormField>

    <div class="flex gap-2">
      <UButton
        color="primary"
        :disabled="!candidateText.trim()"
        @click="handleSubmit"
      >
        Xác nhận
      </UButton>
      <UButton
        variant="outline"
        @click="handleUseDatabase"
      >
        Chọn từ database
      </UButton>
    </div>

    <!-- Step action buttons -->
    <StepActionButtons
      :show-clear="true"
      :show-back="showBack"
      clear-label="Xóa nội dung"
      @clear="handleClear"
      @back="handleBack"
    />
  </div>
</template>

<script setup lang="ts">
import StepActionButtons from './step-action-buttons.vue'

interface Props {
  value?: string
  showBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  showBack: true,
})

const emit = defineEmits<{
  (e: 'update', data: { candidateText?: string; useDatabase?: boolean }): void
  (e: 'clear'): void
  (e: 'back'): void
}>()

const candidateText = ref(props.value)

const handleSubmit = () => {
  if (candidateText.value.trim()) {
    emit('update', {
      candidateText: candidateText.value.trim(),
    })
  }
}

const handleUseDatabase = () => {
  emit('update', { useDatabase: true })
}

const handleClear = () => {
  candidateText.value = ''
  emit('clear')
}

const handleBack = () => {
  emit('back')
}
</script>

