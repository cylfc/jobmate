<template>
  <div class="space-y-4">
    <UFormField label="Chọn ứng viên từ database">
      <USelectMenu
        v-model="selectedCandidateId"
        :options="candidates"
        option-attribute="name"
        value-attribute="id"
        searchable
        placeholder="Tìm kiếm ứng viên..."
        @update:model-value="handleSelect"
      >
        <template #option="{ option }">
          <div class="flex flex-col">
            <span class="font-medium">{{ option.name }}</span>
            <span class="text-sm text-muted">{{ option.email }}</span>
          </div>
        </template>
      </USelectMenu>
    </UFormField>

    <div v-if="selectedCandidate" class="p-4 border rounded-lg bg-muted">
      <h4 class="font-semibold mb-2">{{ selectedCandidate.name }}</h4>
      <p class="text-sm text-muted">{{ selectedCandidate.email }}</p>
    </div>

    <UButton
      v-if="selectedCandidateId"
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
  candidates?: Array<{
    id: string
    name: string
    email: string
  }>
  value?: string
}

const props = withDefaults(defineProps<Props>(), {
  candidates: () => [],
  value: undefined,
})

const emit = defineEmits<{
  (e: 'update', data: { candidateId: string; candidate: any }): void
}>()

const selectedCandidateId = ref(props.value)
const selectedCandidate = computed(() => {
  return props.candidates.find((c) => c.id === selectedCandidateId.value)
})

const handleSelect = (candidateId: string) => {
  selectedCandidateId.value = candidateId
}

const handleConfirm = () => {
  if (selectedCandidate.value) {
    emit('update', {
      candidateId: selectedCandidate.value.id,
      candidate: selectedCandidate.value,
    })
  }
}
</script>

