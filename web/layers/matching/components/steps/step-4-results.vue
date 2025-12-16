<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold mb-2">{{ t('matching.step-4.title') }}</h2>
      <p class="text-muted">{{ t('matching.step-4.description') }}</p>
    </div>

    <TablesMatchingResultsTable
      :matchings="localMatchings"
      @export="handleExport"
      @view-details="handleViewDetails"
      @schedule-interview="handleScheduleInterview"
      @send-message="handleSendMessage"
      @save-candidate="handleSaveCandidate"
      @bulk-save-candidate="handleBulkSaveCandidate"
      @bulk-schedule="handleBulkSchedule"
      @bulk-chat="handleBulkChat"
    />

    <USeparator class="my-4" />

    <div class="flex items-center justify-between">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-arrow-left"
        @click="$emit('previous')"
      >
        {{ t('matching.step-4.previous') }}
      </UButton>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-refresh-cw"
          :loading="isLoading"
          @click="handleRefresh"
        >
          {{ t('matching.step-4.refresh') }}
        </UButton>
        <UButton
          color="primary"
          icon="i-lucide-plus"
          @click="$emit('reset')"
        >
          {{ t('matching.step-4.start-new-matching') }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Matching } from '@matching/types/matching'

const { t } = useI18n()

interface Props {
  matchings: Matching[]
}

interface Emits {
  (e: 'previous' | 'reset' | 'refresh'): void
  (e: 'save-candidate', matching: Matching): void
  (e: 'update:matchings', matchings: (Matching & { candidateName?: string })[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getMatchings } = useMatching()
const isLoading = ref(false)
const localMatchings = ref<(Matching & { candidateName?: string; candidateEmail?: string; candidatePhone?: string })[]>([])

// Load matchings when component mounts
onMounted(async () => {
  await loadMatchings()
})

// Watch for props changes (when parent updates matchings from Step 3 or refresh)
watch(() => props.matchings, (newMatchings) => {
  if (newMatchings && newMatchings.length > 0) {
    localMatchings.value = newMatchings as (Matching & { candidateName?: string })[]
    console.log('Step 4 - Updated matchings from props:', localMatchings.value)
  }
}, { immediate: true, deep: true })

const loadMatchings = async () => {
  isLoading.value = true
  try {
    // Try to get matchings from API (database) - but this might be empty if not saved yet
    const apiMatchings = await getMatchings()
    if (apiMatchings && apiMatchings.length > 0) {
      localMatchings.value = apiMatchings as (Matching & { candidateName?: string })[]
      emit('update:matchings', localMatchings.value)
      console.log('Step 4 - Loaded matchings from API:', localMatchings.value)
    } else if (props.matchings && props.matchings.length > 0) {
      // Fallback to props (from Step 3 state or refresh)
      localMatchings.value = props.matchings as (Matching & { candidateName?: string })[]
      console.log('Step 4 - Using matchings from props:', localMatchings.value)
    }
  } catch (error) {
    console.error('Error loading matchings:', error)
    // Fallback to props if API fails
    if (props.matchings && props.matchings.length > 0) {
      localMatchings.value = props.matchings as (Matching & { candidateName?: string })[]
    }
  } finally {
    isLoading.value = false
  }
}

const handleRefresh = async () => {
  isLoading.value = true
  // Emit refresh event to parent - parent will call analyzeMatchings and update matchings
  emit('refresh')
  // Wait a bit for parent to update matchings
  await new Promise(resolve => setTimeout(resolve, 100))
  // Props should be updated by now, watch will handle the update
  isLoading.value = false
}

const handleExport = () => {
  // TODO: Implement export functionality
  console.log('Export matchings')
}

const handleViewDetails = (matching: Matching) => {
  // TODO: Open detail modal
  console.log('View details:', matching)
}

const handleScheduleInterview = (matching: Matching) => {
  // TODO: Open schedule modal
  console.log('Schedule interview:', matching)
}

const handleSendMessage = (matching: Matching) => {
  // TODO: Open chat modal
  console.log('Send message:', matching)
}

const handleSaveCandidate = (matching: Matching) => {
  emit('save-candidate', matching)
}

const handleBulkSaveCandidate = (matchings: string[]) => {
  // TODO: Bulk save candidate action
  console.log('Bulk save candidate:', matchings)
  // Find matching objects by IDs and emit save-candidate for each
  matchings.forEach(id => {
    const matching = localMatchings.value.find(m => m.id === id)
    if (matching) {
      emit('save-candidate', matching)
    }
  })
}

const handleBulkSchedule = (matchings: string[]) => {
  // TODO: Bulk schedule action
  console.log('Bulk schedule:', matchings)
}

const handleBulkChat = (matchings: string[]) => {
  // TODO: Bulk chat action
  console.log('Bulk chat:', matchings)
}
</script>
