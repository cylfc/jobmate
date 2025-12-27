<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-default">{{ t('job.title') }}</h1>
        <p class="mt-2 text-sm text-muted">
          {{ t('job.subtitle') }}
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-lucide-plus"
        @click="showCreateModal = true"
      >
        {{ t('job.create-new') }}
      </UButton>
    </div>

    <!-- Filters Card -->
    <UCard>
      <FiltersJobFilters
        @apply="handleApplyFilters"
        @reset="handleResetFilters"
      />
    </UCard>

    <!-- Table Card -->
    <UCard>
      <TablesJobsTable
        :jobs="jobs"
        :loading="loading"
        :error="error"
        @view-detail="handleViewDetail"
        @delete="handleDelete"
        @match-candidates="handleMatchCandidates"
        @bulk-delete="handleBulkDelete"
      />
    </UCard>

    <!-- Create Modal -->
    <ModalsCreateJobModal
      v-model="showCreateModal"
      @submit="handleCreateJob"
    />
  </div>
</template>

<script setup lang="ts">
import type { Job, CreateJobInput } from '@job/types/job'
import { useJobList } from '@job/composables/use-job-list'
import { useJobFilters } from '@job/composables/use-job-filters'
import { useJob } from '@job/utils/job-api'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()

definePageMeta({
  layout: 'dashboard',
})

// Layer 2: Shared composable for job list state
const {
  jobs,
  loading,
  error,
  fetchJobs,
  addJob,
  removeJob,
  removeJobs,
} = useJobList()

// Layer 3: Query params for filters
const { filters, updateFilters, resetFilters } = useJobFilters()

// Layer 4: Component-local UI state
const showCreateModal = ref(false)

// Track if initial load is done to avoid double fetch
const isInitialLoad = ref(true)

// Load jobs on mount
onMounted(async () => {
  await loadJobs()
  isInitialLoad.value = false
})

// Watch filters and reload when they change (but not on initial load)
watch(filters, async (newFilters) => {
  if (isInitialLoad.value) return
  await fetchJobs(newFilters)
}, { deep: true })

const loadJobs = async () => {
  try {
    // Server handles all filtering based on query params
    await fetchJobs(filters.value)
  } catch (err) {
    toast.add({
      title: t('job.error.load-failed'),
      description: error.value || t('job.error.load-failed-description'),
      color: 'error',
    })
  }
}

const handleApplyFilters = () => {
  // Filters are synced with URL automatically via useJobFilters
  // The watch will automatically reload jobs when filters change
}

const handleResetFilters = () => {
  resetFilters()
  // Filters reset will trigger watch and reload automatically
}

const handleCreateJob = async (input: CreateJobInput) => {
  const jobOps = useJob()
  try {
    const newJob = await jobOps.createJob(input)
    if (newJob) {
      // Optimistically add to list
      addJob(newJob)
      toast.add({
        title: t('job.success.create-success'),
        description: t('job.success.create-success-description'),
        color: 'success',
      })
      showCreateModal.value = false
      // Optionally refresh to get server state
      await loadJobs()
    }
  } catch (error) {
    toast.add({
      title: t('job.error.create-failed'),
      description: t('job.error.create-failed-description'),
      color: 'error',
    })
  }
}

const handleViewDetail = (job: Job) => {
  // TODO: Navigate to detail page or open detail modal
  console.log('View detail:', job)
  toast.add({
    title: t('job.view-detail'),
    description: job.title,
    color: 'info',
  })
}

const handleDelete = async (job: Job) => {
  if (!job.id) return

  const jobOps = useJob()
  // TODO: Add confirmation dialog
  try {
    await jobOps.deleteJob(job.id)
    // Optimistically remove from list
    removeJob(job.id)
    toast.add({
      title: t('job.success.delete-success'),
      description: t('job.success.delete-success-description'),
      color: 'success',
    })
    // Optionally refresh to sync with server
    await loadJobs()
  } catch (error) {
    toast.add({
      title: t('job.error.delete-failed'),
      description: t('job.error.delete-failed-description'),
      color: 'error',
    })
  }
}

const handleMatchCandidates = (job: Job) => {
  // Navigate to matching page with prefill job
  router.push({
    path: '/matching',
    query: {
      prefill: 'job',
      jobId: job.id,
    },
  })
}

const handleBulkDelete = async (jobIds: string[]) => {
  const jobOps = useJob()
  // TODO: Add confirmation dialog
  try {
    await Promise.all(jobIds.map(id => jobOps.deleteJob(id)))
    // Optimistically remove from list
    removeJobs(jobIds)
    toast.add({
      title: t('job.success.bulk-delete-success'),
      description: t('job.success.bulk-delete-success-description', { count: jobIds.length }),
      color: 'success',
    })
    // Optionally refresh to sync with server
    await loadJobs()
  } catch (error) {
    toast.add({
      title: t('job.error.bulk-delete-failed'),
      description: t('job.error.bulk-delete-failed-description'),
      color: 'error',
    })
  }
}
</script>
