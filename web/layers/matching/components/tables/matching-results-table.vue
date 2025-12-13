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
      <UTable
        :rows="filteredMatchings"
        :columns="columns"
        class="w-full"
      >
        <template #score-data="{ row }">
          <div class="flex items-center gap-2">
            <UProgress :value="row.score" :max="100" class="flex-1" />
            <span class="text-sm font-medium w-12 text-right">{{ row.score }}%</span>
          </div>
        </template>

        <template #status-data="{ row }">
          <UBadge
            :color="getStatusColor(row.status)"
            variant="subtle"
          >
            {{ row.status }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center gap-2">
            <UButton
              color="primary"
              variant="ghost"
              size="xs"
              icon="i-lucide-eye"
              @click="$emit('view-details', row)"
            />
            <UDropdown :items="getActionItems(row)">
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-lucide-more-horizontal"
              />
            </UDropdown>
          </div>
        </template>
      </UTable>
    </div>

    <div v-if="selectedMatchings.length > 0" class="p-4 bg-primary-50 rounded-lg">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">
          {{ selectedMatchings.length }} candidate(s) selected
        </p>
        <div class="flex gap-2">
          <UButton
            color="primary"
            variant="outline"
            size="sm"
            @click="$emit('bulk-schedule', selectedMatchings)"
          >
            Schedule Interview
          </UButton>
          <UButton
            color="green"
            variant="outline"
            size="sm"
            @click="$emit('bulk-chat', selectedMatchings)"
          >
            Send Message
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Matching } from '../../types/matching'
import type { DropdownMenuItem } from '@nuxt/ui'

interface Props {
  matchings: Matching[]
}

interface Emits {
  (e: 'export'): void
  (e: 'view-details', matching: Matching): void
  (e: 'schedule-interview', matching: Matching): void
  (e: 'send-message', matching: Matching): void
  (e: 'save-candidate', matching: Matching): void
  (e: 'bulk-schedule', matchings: string[]): void
  (e: 'bulk-chat', matchings: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showFilters = ref(false)
const sortBy = ref('score')
const searchQuery = ref('')
const minScore = ref(0)
const selectedMatchings = ref<string[]>([])

const columns = [
  { key: 'candidateName', label: 'Candidate' },
  { key: 'score', label: 'Match Score' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

const sortOptions = [
  { label: 'Score (High to Low)', value: 'score' },
  { label: 'Score (Low to High)', value: 'score-asc' },
  { label: 'Name (A-Z)', value: 'name' },
  { label: 'Name (Z-A)', value: 'name-desc' },
]

const filteredMatchings = computed(() => {
  let filtered = [...props.matchings]

  if (minScore.value > 0) {
    filtered = filtered.filter(m => m.score >= minScore.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(m => {
      // TODO: Filter by candidate name when candidate data is available
      return true
    })
  }

  if (sortBy.value === 'score') {
    filtered.sort((a, b) => b.score - a.score)
  } else if (sortBy.value === 'score-asc') {
    filtered.sort((a, b) => a.score - b.score)
  }

  return filtered
})

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'orange',
    accepted: 'green',
    rejected: 'red',
  }
  return statusMap[status] || 'gray'
}

const getActionItems = (row: Matching): DropdownMenuItem[][] => {
  return [
    [
      {
        label: 'View Details',
        icon: 'i-lucide-eye',
        onSelect: () => emit('view-details', row),
      },
      {
        label: 'Schedule Interview',
        icon: 'i-lucide-calendar',
        onSelect: () => emit('schedule-interview', row),
      },
    ],
    [
      {
        label: 'Send Message',
        icon: 'i-lucide-message-square',
        onSelect: () => emit('send-message', row),
      },
      {
        label: 'Save Candidate',
        icon: 'i-lucide-bookmark',
        onSelect: () => emit('save-candidate', row),
      },
    ],
  ]
}
</script>

