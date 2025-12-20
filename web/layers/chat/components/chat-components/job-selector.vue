<template>
  <div class="space-y-4">
    <UFormField label="Chọn công việc từ database">
      <USelectMenu
        v-model="selectedJobId"
        :options="jobs"
        option-attribute="title"
        value-attribute="id"
        searchable
        placeholder="Tìm kiếm công việc..."
        @update:model-value="handleSelect"
      >
        <template #option="{ option }">
          <div class="flex flex-col">
            <span class="font-medium">{{ option.title }}</span>
            <span class="text-sm text-muted">{{ option.company }}</span>
          </div>
        </template>
      </USelectMenu>
    </UFormField>

    <div v-if="selectedJob" class="p-4 border rounded-lg bg-muted">
      <h4 class="font-semibold mb-2">{{ selectedJob.title }}</h4>
      <p class="text-sm text-muted">{{ selectedJob.description }}</p>
    </div>

    <UButton
      v-if="selectedJobId"
      color="primary"
      block
      @click="handleConfirm"
    >
      Xác nhận
    </UButton>
  </div>
</template>

<script setup lang="ts">
interface Props {
  jobs?: Array<{
    id: string
    title: string
    company: string
    description?: string
  }>
  value?: string
}

const props = withDefaults(defineProps<Props>(), {
  jobs: () => [],
  value: undefined,
})

const emit = defineEmits<{
  (e: 'update', data: { jobId: string; job: any }): void
}>()

const selectedJobId = ref(props.value)
const selectedJob = computed(() => {
  return props.jobs.find((j) => j.id === selectedJobId.value)
})

const handleSelect = (jobId: string) => {
  selectedJobId.value = jobId
}

const handleConfirm = () => {
  if (selectedJob.value) {
    emit('update', {
      jobId: selectedJob.value.id,
      job: selectedJob.value,
    })
  }
}
</script>

