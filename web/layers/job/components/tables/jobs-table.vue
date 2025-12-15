<template>
  <div class="space-y-4">
    <div class="overflow-x-auto">
      <!-- eslint-disable vue/no-v-model-argument -->
      <UTable
        ref="table"
        v-model:row-selection="rowSelection"
        :data="filteredJobs"
        :columns="columns"
        :loading="loading"
        class="w-full jobs-table"
      >
      <!-- eslint-enable vue/no-v-model-argument -->

        <template #title-cell="{ row }">
          <span class="font-medium">{{ row.original.title }}</span>
        </template>

        <template #company-cell="{ row }">
          <div class="flex flex-col">
            <span>{{ row.original.company }}</span>
            <span v-if="row.original.location" class="text-xs text-gray-500">
              {{ row.original.location }}
            </span>
          </div>
        </template>

        <template #requirements-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="(req, index) in row.original.requirements.slice(0, 3)"
              :key="index"
              color="neutral"
              variant="subtle"
              size="md"
            >
              {{ req }}
            </UBadge>
            <UBadge
              v-if="row.original.requirements.length > 3"
              color="neutral"
              variant="subtle"
              size="xs"
            >
              +{{ row.original.requirements.length - 3 }}
            </UBadge>
          </div>
        </template>

        <template #salary-cell="{ row }">
          <span v-if="row.original.salary" class="text-sm">
            {{ formatSalary(row.original.salary) }}
          </span>
          <span v-else class="text-sm text-gray-400">{{ t('job.salary-not-specified') }}</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="getStatusColor(row.original.status)"
            variant="subtle"
          >
            {{ t(`job.status.${row.original.status}`) }}
          </UBadge>
        </template>

        <template #candidates-cell="{ row }">
          <div class="flex flex-col">
            <span class="text-sm font-medium">
              {{ row.original.candidates?.active || 0 }} / {{ row.original.candidates?.total || 0 }}
            </span>
            <span class="text-xs text-gray-500">
              {{ t('job.candidates.applying') }} / {{ t('job.candidates.total') }}
            </span>
          </div>
        </template>

        <template #action-cell="{ row }">
          <div class="w-[80px]">
            <UDropdownMenu :items="getActionItems(row.original)">
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                size="xs"
                :aria-label="t('common.actions')"
              />
            </UDropdownMenu>
          </div>
        </template>

        <template #empty-state>
          <div class="text-center py-8">
            <p class="text-gray-500">{{ t('job.no-jobs-found') }}</p>
          </div>
        </template>
      </UTable>
    </div>

    <div v-if="Object.keys(rowSelection).length > 0" class="p-4 bg-primary-50 rounded-lg">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">
          {{ t('job.selected-count', { count: Object.keys(rowSelection).length }) }}
        </p>
        <div class="flex gap-2">
          <UButton
            color="error"
            variant="outline"
            size="sm"
            icon="i-lucide-trash"
            @click="handleBulkDelete"
          >
            {{ t('job.bulk-delete') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { Job } from '@job/types/job'
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'

const UCheckbox = resolveComponent('UCheckbox')
const { t } = useI18n()

interface Props {
  jobs: Job[]
  loading?: boolean
}

interface Emits {
  (e: 'view-detail' | 'delete' | 'match-candidates', job: Job): void
  (e: 'bulk-delete', jobIds: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const rowSelection = ref<Record<string, boolean>>({})
const table = useTemplateRef('table')
const sortBy = ref('title')

const columns: TableColumn<Job>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': t('common.select-all'),
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': t('common.select-row'),
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: t('job.title-label'),
  },
  {
    accessorKey: 'company',
    header: t('job.company'),
  },
  {
    accessorKey: 'requirements',
    header: t('job.requirements'),
  },
  {
    accessorKey: 'salary',
    header: t('job.salary'),
  },
  {
    accessorKey: 'status',
    header: t('job.status-label'),
  },
  {
    accessorKey: 'candidates',
    header: t('job.candidates.label'),
  },
  {
    id: 'action',
    header: t('common.actions'),
    enableSorting: false,
  },
]

const filteredJobs = computed(() => {
  const filtered = [...props.jobs]

  // Apply sorting
  if (sortBy.value === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sortBy.value === 'title-desc') {
    filtered.sort((a, b) => b.title.localeCompare(a.title))
  }

  return filtered
})

const formatSalary = (salary: { min: number; max: number; currency: string }) => {
  return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}`
}

const getStatusColor = (status: string): 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' => {
  const statusMap: Record<string, 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'> = {
    draft: 'neutral',
    published: 'success',
    closed: 'warning',
  }
  return statusMap[status] || 'neutral'
}

const getActionItems = (job: Job): DropdownMenuItem[][] => {
  return [
    [
      {
        label: t('job.view-detail'),
        icon: 'i-lucide-eye',
        onSelect: () => emit('view-detail', job),
      },
    ],
    [
      {
        label: t('job.match-candidates'),
        icon: 'i-lucide-users',
        onSelect: () => emit('match-candidates', job),
      },
      {
        label: t('job.delete'),
        icon: 'i-lucide-trash',
        color: 'error',
        onSelect: () => emit('delete', job),
      },
    ],
  ]
}

const getSelectedIds = (): string[] => {
  return Object.keys(rowSelection.value).filter((key) => rowSelection.value[key])
}

const handleBulkDelete = () => {
  const selectedIds = getSelectedIds()
  emit('bulk-delete', selectedIds)
}

defineExpose({
  sortBy,
})
</script>

<style scoped>
.jobs-table :deep(th:first-child),
.jobs-table :deep(td:first-child) {
  width: 50px;
  min-width: 50px;
  max-width: 50px;
}

.jobs-table :deep(th:last-child),
.jobs-table :deep(td:last-child) {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
}
</style>

