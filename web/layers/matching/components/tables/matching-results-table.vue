<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">{{ t('matching.step-4.matching-results') }}</h3>
        <p class="text-sm text-muted">{{ t('matching.step-4.found-candidates', { count: matchings.length }) }}</p>
      </div>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-download"
          @click="$emit('export')"
        >
          {{ t('matching.step-4.export') }}
        </UButton>
        <UButton
          color="primary"
          variant="outline"
          icon="i-lucide-filter"
          @click="showFilters = !showFilters"
        >
          {{ t('matching.step-4.filters') }}
        </UButton>
      </div>
    </div>

    <div v-if="showFilters" class="p-4 bg-muted rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <USelectMenu
          v-model="sortBy"
          :options="sortOptions"
          :placeholder="t('matching.step-4.sort-by-placeholder')"
        />
        <UInput
          v-model="searchQuery"
          :placeholder="t('matching.step-4.search-candidates')"
          icon="i-lucide-search"
        />
        <UInput
          v-model.number="minScore"
          type="number"
          :placeholder="t('matching.step-4.min-score-placeholder')"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <!-- eslint-disable vue/no-v-model-argument -->
      <UTable
        ref="table"
        v-model:row-selection="rowSelection"
        :data="filteredMatchings"
        :columns="columns"
        class="w-full matching-results-table"
      >
      <!-- eslint-enable vue/no-v-model-argument -->

        <template #candidateName-cell="{ row }">
          <div class="flex flex-col">
            <span class="font-medium">{{ row.original.candidateName || `Candidate ${row.original.candidateId}` }}</span>
            <div class="flex flex-col gap-1 mt-1">
              <span v-if="getCandidateEmail(row.original)" class="text-xs text-muted">
                {{ getCandidateEmail(row.original) }}
              </span>
              <span v-if="getCandidatePhone(row.original)" class="text-xs text-muted">
                {{ getCandidatePhone(row.original) }}
              </span>
            </div>
          </div>
        </template>

        <template #score-cell="{ row }">
          <div class="flex items-center gap-2">
            <UProgress :value="row.original.score" :max="100" class="flex-1" />
            <span class="text-sm font-medium w-12 text-right">{{ row.original.score }}%</span>
          </div>
        </template>

        <template #status-cell="{ row }">
            <UBadge
              :color="getStatusColor(row.original.status)"
              variant="subtle"
            >
              {{ t(`matching.status.${row.original.status}`) || row.original.status }}
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
            <p class="text-muted">{{ t('matching.step-4.no-matching-found') }}</p>
            <p class="text-sm text-dimmed mt-2">{{ t('matching.step-4.filtered', { filtered: filteredMatchings.length }) }}, {{ t('matching.step-4.total', { total: props.matchings?.length || 0 }) }}</p>
          </div>
        </template>
      </UTable>
    </div>

    <div v-if="Object.keys(rowSelection).length > 0" class="p-4 bg-muted rounded-lg">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">
          {{ t('matching.step-4.selected-count', { count: Object.keys(rowSelection).length }) }}
        </p>
        <div class="flex gap-2">
          <UButton
            color="primary"
            variant="outline"
            size="sm"
            icon="i-lucide-bookmark"
            @click="handleBulkSave"
          >
            {{ t('matching.step-4.save-candidate') }}
          </UButton>
          <UButton
            color="primary"
            variant="outline"
            size="sm"
            icon="i-lucide-calendar"
            @click="handleBulkSchedule"
          >
            {{ t('matching.step-4.quick-schedule') }}
          </UButton>
          <UButton
            color="success"
            variant="outline"
            size="sm"
            icon="i-lucide-message-square"
            @click="handleBulkChat"
          >
            {{ t('matching.step-4.send-message') }}
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { Matching } from '@matching/types/matching'
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'

const { t } = useI18n()

type MatchingWithName = Matching & { 
  candidateName?: string
  candidateEmail?: string
  candidatePhone?: string
}

const UCheckbox = resolveComponent('UCheckbox')

interface Props {
  matchings: Matching[]
}

interface Emits {
  (e: 'export'): void
  (e: 'view-details' | 'schedule-interview' | 'send-message' | 'save-candidate', matching: Matching): void
  (e: 'bulk-save-candidate' | 'bulk-schedule' | 'bulk-chat', matchings: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showFilters = ref(false)
const sortBy = ref('score')
const searchQuery = ref('')
const minScore = ref(0)
const rowSelection = ref<Record<string, boolean>>({})
const table = useTemplateRef('table')

const columns: TableColumn<MatchingWithName>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': t('common.select-all')
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row'
      }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'candidateName',
    header: t('matching.step-4.candidate'),
  },
  {
    accessorKey: 'score',
    header: t('matching.step-4.match-score'),
  },
  {
    accessorKey: 'status',
    header: t('matching.step-4.status'),
  },
  {
    id: 'action',
    header: t('common.actions'),
    enableSorting: false,
  },
]

const sortOptions = computed(() => [
  { label: t('matching.step-4.score-high-to-low'), value: 'score' },
  { label: t('matching.step-4.score-low-to-high'), value: 'score-asc' },
  { label: t('matching.step-4.name-a-z'), value: 'name' },
  { label: t('matching.step-4.name-z-a'), value: 'name-desc' },
])

const filteredMatchings = computed(() => {
  // Debug: Log matchings data
  console.log('MatchingResultsTable - Received matchings:', props.matchings)
  console.log('MatchingResultsTable - Props matchings length:', props.matchings?.length)

  // Map matchings to include candidateName for display
  let filtered = (props.matchings || []).map(m => ({
    ...m,
    candidateName: (m as MatchingWithName).candidateName || `Candidate ${m.candidateId}`,
  })) as MatchingWithName[]

  console.log('MatchingResultsTable - Filtered matchings:', filtered)
  console.log('MatchingResultsTable - Filtered matchings length:', filtered.length)

  if (minScore.value > 0) {
    filtered = filtered.filter(m => m.score >= minScore.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(m => {
      const candidateName = m.candidateName || ''
      return candidateName.toLowerCase().includes(query)
    })
  }

  if (sortBy.value === 'score') {
    filtered.sort((a, b) => b.score - a.score)
  } else if (sortBy.value === 'score-asc') {
    filtered.sort((a, b) => a.score - b.score)
  } else if (sortBy.value === 'name') {
    filtered.sort((a, b) => {
      const nameA = (a.candidateName || '').toLowerCase()
      const nameB = (b.candidateName || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })
  } else if (sortBy.value === 'name-desc') {
    filtered.sort((a, b) => {
      const nameA = (a.candidateName || '').toLowerCase()
      const nameB = (b.candidateName || '').toLowerCase()
      return nameB.localeCompare(nameA)
    })
  }

  return filtered
})

const getStatusColor = (status: string): 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' => {
  const statusMap: Record<string, 'neutral' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error'> = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'error',
  }
  // Note: Status labels are already translated in the badge display
  return statusMap[status] || 'neutral'
}

const getCandidateEmail = (matching: Matching | MatchingWithName): string | undefined => {
  return (matching as MatchingWithName).candidateEmail
}

const getCandidatePhone = (matching: Matching | MatchingWithName): string | undefined => {
  return (matching as MatchingWithName).candidatePhone
}

const getActionItems = (row: MatchingWithName): DropdownMenuItem[][] => {
  return [
    [
      {
        label: t('matching.step-4.view-detail'),
        icon: 'i-lucide-eye',
        onSelect: () => emit('view-details', row),
      },
    ],
    [
      {
        label: t('matching.step-4.save-candidate'),
        icon: 'i-lucide-bookmark',
        onSelect: () => emit('save-candidate', row),
      },
      {
        label: t('matching.step-4.quick-schedule'),
        icon: 'i-lucide-calendar',
        onSelect: () => emit('schedule-interview', row),
      },
      {
        label: t('matching.step-4.send-message'),
        icon: 'i-lucide-message-square',
        onSelect: () => emit('send-message', row),
      },
    ],
  ]
}

const getSelectedIds = (): string[] => {
  return Object.keys(rowSelection.value).filter(key => rowSelection.value[key])
}

const handleBulkSave = () => {
  const selectedIds = getSelectedIds()
  emit('bulk-save-candidate', selectedIds)
}

const handleBulkSchedule = () => {
  const selectedIds = getSelectedIds()
  emit('bulk-schedule', selectedIds)
}

const handleBulkChat = () => {
  const selectedIds = getSelectedIds()
  emit('bulk-chat', selectedIds)
}
</script>

<style scoped>
.matching-results-table :deep(th:first-child),
.matching-results-table :deep(td:first-child) {
  width: 50px;
  min-width: 50px;
  max-width: 50px;
}

.matching-results-table :deep(th:last-child),
.matching-results-table :deep(td:last-child) {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
}
</style>

