<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ t('candidate.title') }}</h1>
        <p class="mt-2 text-sm text-gray-600">
          {{ t('candidate.subtitle') }}
        </p>
      </div>
      <UButton
        color="primary"
        icon="i-lucide-plus"
        @click="showCreateModal = true"
      >
        {{ t('candidate.create-new') }}
      </UButton>
    </div>

    <!-- Filters Card -->
    <UCard>
      <FiltersCandidateFilters
        v-model="filters"
        @apply="handleApplyFilters"
        @reset="handleResetFilters"
      />
    </UCard>

    <!-- Table Card -->
    <UCard>
      <TablesCandidatesTable
        :candidates="filteredCandidates"
        :loading="isLoading"
        @view-detail="handleViewDetail"
        @invite="handleInvite"
        @delete="handleDelete"
        @bulk-invite="handleBulkInvite"
        @bulk-delete="handleBulkDelete"
      />
    </UCard>

    <!-- Create Modal -->
    <ModalsCreateCandidateModal
      v-model="showCreateModal"
      @submit="handleCreateCandidate"
    />
  </div>
</template>

<script setup lang="ts">
import type { Candidate, CreateCandidateInput, CandidateFilter } from '@candidate/types/candidate'

const { t } = useI18n()
const toast = useToast()

definePageMeta({
  layout: 'dashboard',
})

const { getCandidates, createCandidate, deleteCandidate, inviteCandidate } = useCandidate()

const candidates = ref<Candidate[]>([])
const isLoading = ref(false)
const showCreateModal = ref(false)
const filters = ref<CandidateFilter>({})

// Load candidates on mount
onMounted(async () => {
  await loadCandidates()
})

const loadCandidates = async () => {
  isLoading.value = true
  try {
    const data = await getCandidates()
    candidates.value = data
  } catch (error) {
    toast.add({
      title: t('candidate.error.load-failed'),
      description: t('candidate.error.load-failed-description'),
      color: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

const filteredCandidates = computed(() => {
  let filtered = [...candidates.value]

  // Apply search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
    )
  }

  // Apply status filter
  if (filters.value.status) {
    filtered = filtered.filter((c) => c.status === filters.value.status)
  }

  // Apply experience filters
  if (filters.value.minExperience !== undefined) {
    filtered = filtered.filter((c) => c.experience >= filters.value.minExperience!)
  }

  if (filters.value.maxExperience !== undefined) {
    filtered = filtered.filter((c) => c.experience <= filters.value.maxExperience!)
  }

  return filtered
})

const handleApplyFilters = () => {
  // Filters are applied automatically via computed property
}

const handleResetFilters = () => {
  filters.value = {}
}

const handleCreateCandidate = async (input: CreateCandidateInput) => {
  try {
    await createCandidate(input)
    toast.add({
      title: t('candidate.success.create-success'),
      description: t('candidate.success.create-success-description'),
      color: 'success',
    })
    showCreateModal.value = false
    await loadCandidates()
  } catch (error) {
    toast.add({
      title: t('candidate.error.create-failed'),
      description: t('candidate.error.create-failed-description'),
      color: 'error',
    })
  }
}

const handleViewDetail = (candidate: Candidate) => {
  // TODO: Navigate to detail page or open detail modal
  console.log('View detail:', candidate)
  toast.add({
    title: t('candidate.view-detail'),
    description: `${candidate.firstName} ${candidate.lastName}`,
    color: 'info',
  })
}

const handleInvite = async (candidate: Candidate) => {
  try {
    if (!candidate.id) return
    await inviteCandidate(candidate.id)
    toast.add({
      title: t('candidate.success.invite-success'),
      description: t('candidate.success.invite-success-description', { name: `${candidate.firstName} ${candidate.lastName}` }),
      color: 'success',
    })
  } catch (error) {
    toast.add({
      title: t('candidate.error.invite-failed'),
      description: t('candidate.error.invite-failed-description'),
      color: 'error',
    })
  }
}

const handleDelete = async (candidate: Candidate) => {
  if (!candidate.id) return
  
  // TODO: Add confirmation dialog
  try {
    await deleteCandidate(candidate.id)
    toast.add({
      title: t('candidate.success.delete-success'),
      description: t('candidate.success.delete-success-description'),
      color: 'success',
    })
    await loadCandidates()
  } catch (error) {
    toast.add({
      title: t('candidate.error.delete-failed'),
      description: t('candidate.error.delete-failed-description'),
      color: 'error',
    })
  }
}

const handleBulkInvite = async (candidateIds: string[]) => {
  try {
    await Promise.all(candidateIds.map(id => inviteCandidate(id)))
    toast.add({
      title: t('candidate.success.bulk-invite-success'),
      description: t('candidate.success.bulk-invite-success-description', { count: candidateIds.length }),
      color: 'success',
    })
  } catch (error) {
    toast.add({
      title: t('candidate.error.bulk-invite-failed'),
      description: t('candidate.error.bulk-invite-failed-description'),
      color: 'error',
    })
  }
}

const handleBulkDelete = async (candidateIds: string[]) => {
  // TODO: Add confirmation dialog
  try {
    await Promise.all(candidateIds.map(id => deleteCandidate(id)))
    toast.add({
      title: t('candidate.success.bulk-delete-success'),
      description: t('candidate.success.bulk-delete-success-description', { count: candidateIds.length }),
      color: 'success',
    })
    await loadCandidates()
  } catch (error) {
    toast.add({
      title: t('candidate.error.bulk-delete-failed'),
      description: t('candidate.error.bulk-delete-failed-description'),
      color: 'error',
    })
  }
}
</script>
