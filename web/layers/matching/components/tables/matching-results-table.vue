<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Matching Results</h3>
        <p class="text-sm text-gray-600">Found {{ matchings.length }} matching candidates</p>
      </div>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-download"
          @click="$emit('export')"
        >
          Export
        </UButton>
        <UButton
          color="primary"
          variant="outline"
          icon="i-lucide-filter"
          @click="showFilters = !showFilters"
        >
          Filters
        </UButton>
      </div>
    </div>

    <div v-if="showFilters" class="p-4 bg-gray-50 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <USelectMenu
          v-model="sortBy"
          :options="sortOptions"
          placeholder="Sort by"
        />
        <UInput
          v-model="searchQuery"
          placeholder="Search candidates..."
          icon="i-lucide-search"
        />
        <UInput
          v-model.number="minScore"
          type="number"
          placeholder="Min score"
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
              <span v-if="getCandidateEmail(row.original)" class="text-xs text-gray-500">
                {{ getCandidateEmail(row.original) }}
              </span>
              <span v-if="getCandidatePhone(row.original)" class="text-xs text-gray-500">
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
            {{ row.original.status }}
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
                aria-label="Actions"
              />
            </UDropdownMenu>
          </div>
        </template>

        <template #empty-state>
          <div class="text-center py-8">
            <p class="text-gray-500">No matching candidates found</p>
            <p class="text-sm text-gray-400 mt-2">Filtered: {{ filteredMatchings.length }}, Total: {{ props.matchings?.length || 0 }}</p>
          </div>
        </template>
      </UTable>
    </div>

    <div v-if="Object.keys(rowSelection).length > 0" class="p-4 bg-primary-50 rounded-lg">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">
          Đã chọn {{ Object.keys(rowSelection).length }} ứng viên
        </p>
        <div class="flex gap-2">
          <UButton
            color="primary"
            variant="outline"
            size="sm"
            icon="i-lucide-bookmark"
            @click="handleBulkSave"
          >
            Lưu ứng viên
          </UButton>
          <UButton
            color="primary"
            variant="outline"
            size="sm"
            icon="i-lucide-calendar"
            @click="handleBulkSchedule"
          >
            Đặt lịch nhanh
          </UButton>
          <UButton
            color="success"
            variant="outline"
            size="sm"
            icon="i-lucide-message-square"
            @click="handleBulkChat"
          >
            Gửi tin nhắn
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
        'aria-label': 'Select all'
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
    header: 'Candidate',
  },
  {
    accessorKey: 'score',
    header: 'Match Score',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    id: 'action',
    header: 'Actions',
    enableSorting: false,
  },
]

const sortOptions = [
  { label: 'Score (High to Low)', value: 'score' },
  { label: 'Score (Low to High)', value: 'score-asc' },
  { label: 'Name (A-Z)', value: 'name' },
  { label: 'Name (Z-A)', value: 'name-desc' },
]

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
        label: 'Xem chi tiết',
        icon: 'i-lucide-eye',
        onSelect: () => emit('view-details', row),
      },
    ],
    [
      {
        label: 'Lưu ứng viên',
        icon: 'i-lucide-bookmark',
        onSelect: () => emit('save-candidate', row),
      },
      {
        label: 'Đặt lịch nhanh',
        icon: 'i-lucide-calendar',
        onSelect: () => emit('schedule-interview', row),
      },
      {
        label: 'Gửi tin nhắn',
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

