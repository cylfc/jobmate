<template>
  <div class="flex flex-row justify-between space-y-4">
    <div class="flex flex-row justify-start items-start gap-4">
      <UFormField :label="t('job.filter.search')" name="search">
        <UInput
          v-model="filters.search"
          :placeholder="t('job.filter.search-placeholder')"
          icon="i-lucide-search"
          clearable
        />
      </UFormField>

      <UFormField :label="t('job.filter.status')" name="status">
        <USelectMenu
          v-model="filters.status"
          :options="statusOptions"
          :placeholder="t('job.filter.status-placeholder')"
          clearable
        />
      </UFormField>

      <UFormField :label="t('job.filter.company')" name="company">
        <UInput
          v-model="filters.company"
          :placeholder="t('job.filter.company-placeholder')"
          clearable
        />
      </UFormField>

      <UFormField :label="t('job.filter.location')" name="location">
        <UInput
          v-model="filters.location"
          :placeholder="t('job.filter.location-placeholder')"
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
        {{ t('job.filter.reset') }}
      </UButton>
      <UButton
        color="primary"
        size="sm"
        @click="handleApply"
      >
        {{ t('job.filter.apply') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JobFilter, JobStatus } from '@job/types/job'

const { t } = useI18n()

interface Props {
  // No props needed - using defineModel
}

interface Emits {
  (e: 'apply'): void
  (e: 'reset'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const filters = defineModel<JobFilter>({ required: true })

const statusOptions = computed(() => [
  { label: t('job.status.draft'), value: 'draft' as JobStatus },
  { label: t('job.status.published'), value: 'published' as JobStatus },
  { label: t('job.status.closed'), value: 'closed' as JobStatus },
])

const handleApply = () => {
  emit('apply')
}

const handleReset = () => {
  emit('update:modelValue', {})
  emit('reset')
}
</script>

