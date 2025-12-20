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
  (e: 'update', data: { jobText?: string; useDatabase?: boolean }): void
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
</script>

