<template>
  <div class="space-y-4">
    <div class="overflow-x-auto">
      <!-- eslint-disable vue/no-v-model-argument -->
      <UTable
        ref="table"
        v-model:row-selection="rowSelection"
        :data="filteredCandidates"
        :columns="columns"
        class="w-full candidates-table"
      >
      <!-- eslint-enable vue/no-v-model-argument -->

        <template #name-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-medium">{{ getCandidateName(row.original) }}</span>
            <div class="flex flex-col gap-1 mt-1">
              <span v-if="row.original.email" class="text-xs text-muted">
                {{ row.original.email }}
              </span>
              <span v-if="row.original.phone" class="text-xs text-muted">
                {{ row.original.phone }}
              </span>
            </div>
          </div>
        </template>

        <template #skills-cell="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge
              v-for="(skill, index) in row.original.skills.slice(0, 3)"
              :key="index"
              color="neutral"
              variant="subtle"
              size="md"
            >
              {{ skill }}
            </UBadge>
            <UBadge
              v-if="row.original.skills.length > 3"
              color="neutral"
              variant="subtle"
              size="md"
            >
              +{{ row.original.skills.length - 3 }}
            </UBadge>
          </div>
        </template>

        <template #experience-cell="{ row }">
          <span class="text-sm">{{ row.original.experience }} {{ t('candidate.years') }}</span>
        </template>

        <template #current-company-cell="{ row }">
          <span class="text-sm">{{ row.original.currentCompany || '-' }}</span>
        </template>

        <template #expectedSalary-cell="{ row }">
          <span class="text-sm">
            {{ formatSalary(row.original.expectedSalary) }}
          </span>
        </template>

        <template #status-cell="{ row }">
          <UBadge
            :color="getStatusColor(row.original.status)"
            variant="subtle"
          >
            {{ t(`candidate.status.${row.original.status || 'active'}`) }}
          </UBadge>
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
            <p class="text-muted">{{ t('candidate.no-candidates-found') }}</p>
          </div>
        </template>
      </UTable>
    </div>

    <div v-if="Object.keys(rowSelection).length > 0" class="p-4 bg-muted rounded-lg">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">
          {{ t('candidate.selected-count', { count: Object.keys(rowSelection).length }) }}
        </p>
        <div class="flex gap-2">
          <UButton
            color="primary"
            variant="outline"
            size="sm"
            icon="i-lucide-mail"
            @click="handleBulkInvite"
          >
            {{ t('candidate.bulk-invite') }}
          </UButton>
          <UButton
            color="primary"
            variant="outline"
            size="sm"
            icon="i-lucide-briefcase"
            @click="handleBulkMatchJobs"
          >
            {{ t('candidate.bulk-match-jobs') }}
          </UButton>
          <UButton
            color="error"
            variant="outline"
            size="sm"
            icon="i-lucide-trash"
            @click="handleBulkDelete"
          >
            {{ t('candidate.bulk-delete') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { Candidate } from '@candidate/types/candidate'
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'

const UCheckbox = resolveComponent('UCheckbox')
const { t } = useI18n()

interface Props {
  candidates: Candidate[]
  loading?: boolean
}

interface Emits {
  (e: 'view-detail' | 'invite' | 'delete' | 'match-jobs' | 'edit', candidate: Candidate): void
  (e: 'bulk-invite' | 'bulk-delete' | 'bulk-match-jobs', candidateIds: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<Emits>()

const rowSelection = ref<Record<string, boolean>>({})
const table = useTemplateRef('table')
const sortBy = ref('name')

const columns: TableColumn<Candidate>[] = [
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
    accessorKey: 'name',
    header: t('candidate.name'),
  },
  {
    accessorKey: 'skills',
    header: t('candidate.skills'),
  },
  {
    accessorKey: 'experience',
    header: t('candidate.experience'),
  },
  {
    accessorKey: 'currentCompany',
    header: t('candidate.current-company'),
  },
  {
    id: 'expectedSalary',
    accessorFn: (row: Candidate) => row.expectedSalary,
    header: t('candidate.expected-salary'),
  },
  {
    accessorKey: 'status',
    header: t('candidate.status-label'),
  },
  {
    id: 'action',
    header: t('common.actions'),
    enableSorting: false,
  },
]

const filteredCandidates = computed(() => {
  const filtered = [...props.candidates]

  // Apply sorting
  if (sortBy.value === 'name') {
    filtered.sort((a, b) => {
      const nameA = getCandidateName(a).toLowerCase()
      const nameB = getCandidateName(b).toLowerCase()
      return nameA.localeCompare(nameB)
    })
  } else if (sortBy.value === 'name-desc') {
    filtered.sort((a, b) => {
      const nameA = getCandidateName(a).toLowerCase()
      const nameB = getCandidateName(b).toLowerCase()
      return nameB.localeCompare(nameA)
    })
  } else if (sortBy.value === 'experience') {
    filtered.sort((a, b) => b.experience - a.experience)
  } else if (sortBy.value === 'experience-desc') {
    filtered.sort((a, b) => a.experience - b.experience)
  }

  return filtered
})

const getCandidateName = (candidate: Candidate) => {
  return `${candidate.firstName} ${candidate.lastName}`.trim()
}

const formatSalary = (salary?: { min?: number; max?: number; currency?: string }) => {
  if (!salary || typeof salary !== 'object') {
    return '-'
  }
  if (salary.min !== undefined && salary.max !== undefined && salary.currency) {
    return `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}`
  }
  if (salary.min !== undefined && salary.currency) {
    return `${salary.min.toLocaleString()} ${salary.currency}`
  }
  return '-'
}

const getStatusColor = (status?: string): 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' => {
  const statusMap: Record<string, 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'> = {
    active: 'success',
    inactive: 'warning',
    archived: 'neutral',
  }
  return statusMap[status || 'active'] || 'neutral'
}

const getActionItems = (candidate: Candidate): DropdownMenuItem[][] => {
  return [
    [
      {
        label: t('candidate.view-detail'),
        icon: 'i-lucide-eye',
        onSelect: () => emit('view-detail', candidate),
      },
      {
        label: t('common.edit'),
        icon: 'i-lucide-pencil',
        onSelect: () => emit('edit', candidate),
      },
    ],
    [
      {
        label: t('candidate.invite'),
        icon: 'i-lucide-mail',
        onSelect: () => emit('invite', candidate),
      },
      {
        label: t('candidate.match-jobs'),
        icon: 'i-lucide-briefcase',
        onSelect: () => emit('match-jobs', candidate),
      },
      {
        label: t('candidate.delete'),
        icon: 'i-lucide-trash',
        onSelect: () => emit('delete', candidate),
      },
    ],
  ]
}

const getSelectedIds = (): string[] => {
  return Object.keys(rowSelection.value).filter((key) => rowSelection.value[key])
}

const handleBulkInvite = () => {
  const selectedIds = getSelectedIds()
  emit('bulk-invite', selectedIds)
}

const handleBulkDelete = () => {
  const selectedIds = getSelectedIds()
  emit('bulk-delete', selectedIds)
}

const handleBulkMatchJobs = () => {
  const selectedIds = getSelectedIds()
  emit('bulk-match-jobs', selectedIds)
}

defineExpose({
  sortBy,
})
</script>

<style scoped>
.candidates-table :deep(th:first-child),
.candidates-table :deep(td:first-child) {
  width: 50px;
  min-width: 50px;
  max-width: 50px;
}

.candidates-table :deep(th:last-child),
.candidates-table :deep(td:last-child) {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
}
</style>

