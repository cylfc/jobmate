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
        v-model="filters"
        @apply="handleApplyFilters"
        @reset="handleResetFilters"
      />
    </UCard>

    <!-- Table Card -->
    <UCard>
      <TablesJobsTable
        :jobs="filteredJobs"
        :loading="isLoading"
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
import type { Job, CreateJobInput, JobFilter } from '@job/types/job'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()

definePageMeta({
  layout: 'dashboard',
})

const { getJobs, createJob, deleteJob } = useJob()

const jobs = ref<Job[]>([])
const isLoading = ref(false)
const showCreateModal = ref(false)
const filters = ref<JobFilter>({})

// Load jobs on mount
onMounted(async () => {
  await loadJobs()
})

const loadJobs = async () => {
  isLoading.value = true
  try {
    const data = await getJobs(filters.value)
    jobs.value = data
  } catch (_error) {
    toast.add({
      title: t('job.error.load-failed'),
      description: t('job.error.load-failed-description'),
      color: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

const filteredJobs = computed(() => {
  let filtered = [...jobs.value]

  // Apply search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(search) ||
        j.description.toLowerCase().includes(search) ||
        j.company.toLowerCase().includes(search)
    )
  }

  // Apply status filter
  if (filters.value.status) {
    filtered = filtered.filter((j) => j.status === filters.value.status)
  }

  // Apply company filter
  if (filters.value.company) {
    filtered = filtered.filter((j) =>
      j.company.toLowerCase().includes(filters.value.company!.toLowerCase())
    )
  }

  // Apply location filter
  if (filters.value.location) {
    filtered = filtered.filter((j) =>
      j.location.toLowerCase().includes(filters.value.location!.toLowerCase())
    )
  }

  return filtered
})

const handleApplyFilters = () => {
  loadJobs()
}

const handleResetFilters = () => {
  filters.value = {}
  loadJobs()
}

const handleCreateJob = async (input: CreateJobInput) => {
  try {
    await createJob(input)
    toast.add({
      title: t('job.success.create-success'),
      description: t('job.success.create-success-description'),
      color: 'success',
    })
    showCreateModal.value = false
    await loadJobs()
  } catch (_error) {
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

  // TODO: Add confirmation dialog
  try {
    await deleteJob(job.id)
    toast.add({
      title: t('job.success.delete-success'),
      description: t('job.success.delete-success-description'),
      color: 'success',
    })
    await loadJobs()
  } catch (_error) {
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
  // TODO: Add confirmation dialog
  try {
    await Promise.all(jobIds.map(id => deleteJob(id)))
    toast.add({
      title: t('job.success.bulk-delete-success'),
      description: t('job.success.bulk-delete-success-description', { count: jobIds.length }),
      color: 'success',
    })
    await loadJobs()
  } catch (_error) {
    toast.add({
      title: t('job.error.bulk-delete-failed'),
      description: t('job.error.bulk-delete-failed-description'),
      color: 'error',
    })
  }
}
</script>
