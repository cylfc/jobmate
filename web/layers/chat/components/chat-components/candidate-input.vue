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
  </div>
</template>

<script setup lang="ts">
interface Props {
  value?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
})

const emit = defineEmits<{
  (e: 'update', data: { candidateText?: string; useDatabase?: boolean }): void
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
</script>

