<template>
  <div class="space-y-4">
    <UFormField label="Nhập thông tin công việc">
      <UTextarea
        v-model="jobText"
        placeholder="Dán mô tả công việc hoặc link đến job posting..."
        :rows="8"
      />
    </UFormField>

    <div class="flex gap-2">
      <UButton
        color="primary"
        :disabled="!jobText.trim()"
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
  (e: 'update', data: { jobText?: string; useDatabase?: boolean }): void
  (e: 'clear'): void
  (e: 'back'): void
}>()

const jobText = ref(props.value)

const handleSubmit = () => {
  if (jobText.value.trim()) {
    emit('update', {
      jobText: jobText.value.trim(),
    })
  }
}

const handleUseDatabase = () => {
  emit('update', { useDatabase: true })
}

const handleClear = () => {
  jobText.value = ''
  emit('clear')
}

const handleBack = () => {
  emit('back')
}
</script>

