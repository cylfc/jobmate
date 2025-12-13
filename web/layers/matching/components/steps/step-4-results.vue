<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold mb-2">Step 4: Matching Results</h2>
      <p class="text-gray-600">Review and manage matching candidates</p>
    </div>

    <MatchingResultsTable
      :matchings="matchings"
      @export="handleExport"
      @view-details="handleViewDetails"
      @schedule-interview="handleScheduleInterview"
      @send-message="handleSendMessage"
      @save-candidate="handleSaveCandidate"
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
        Previous
      </UButton>
      <UButton
        color="primary"
        icon="i-lucide-refresh-cw"
        @click="$emit('reset')"
      >
        Start New Matching
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Matching } from '../../types/matching'

interface Props {
  matchings: Matching[]
}

interface Emits {
  (e: 'previous'): void
  (e: 'reset'): void
  (e: 'save-candidate', matching: Matching): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

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

const handleBulkSchedule = (matchings: string[]) => {
  // TODO: Bulk schedule action
  console.log('Bulk schedule:', matchings)
}

const handleBulkChat = (matchings: string[]) => {
  // TODO: Bulk chat action
  console.log('Bulk chat:', matchings)
}
</script>
