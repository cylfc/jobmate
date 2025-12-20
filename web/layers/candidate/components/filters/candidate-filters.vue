<template>
  <div class="flex flex-row justify-between space-y-4">
    <div class="flex flex-row justify-start items-start gap-4">
      <UFormField :label="t('candidate.filter.search')" name="search">
        <UInput
          v-model="filters.search"
          :placeholder="t('candidate.filter.search-placeholder')"
          icon="i-lucide-search"
          clearable
        />
      </UFormField>

      <UFormField :label="t('candidate.filter.status')" name="status">
        <USelectMenu
          v-model="filters.status"
          :options="statusOptions"
          :placeholder="t('candidate.filter.status-placeholder')"
          clearable
        />
      </UFormField>

      <UFormField :label="t('candidate.filter.min-experience')" name="minExperience">
        <UInput
          v-model.number="filters.minExperience"
          type="number"
          :placeholder="t('candidate.filter.min-experience-placeholder')"
          clearable
        />
      </UFormField>

      <UFormField :label="t('candidate.filter.max-experience')" name="maxExperience">
        <UInput
          v-model.number="filters.maxExperience"
          type="number"
          :placeholder="t('candidate.filter.max-experience-placeholder')"
          clearable
        />
      </UFormField>
    </div>

    <div class="flex items-center justify-end gap-2">
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        @click="handleReset"
      >
        {{ t('candidate.filter.reset') }}
      </UButton>
      <UButton
        color="primary"
        size="sm"
        @click="handleApply"
      >
        {{ t('candidate.filter.apply') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface CandidateFilter {
  search?: string
  status?: string
  minExperience?: number
  maxExperience?: number
}

interface Props {
  // No props needed - using defineModel
}

interface Emits {
  (e: 'apply'): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const filters = defineModel<CandidateFilter>({ required: true })

const statusOptions = computed(() => [
  { label: t('candidate.status.active'), value: 'active' },
  { label: t('candidate.status.inactive'), value: 'inactive' },
  { label: t('candidate.status.archived'), value: 'archived' },
])

const handleApply = () => {
  emit('apply')
}

const handleReset = () => {
  emit('update:modelValue', {})
  emit('reset')
}
</script>

