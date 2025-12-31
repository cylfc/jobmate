<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-default">{{ t('candidate.title') }}</h1>
        <p class="mt-2 text-sm text-muted">
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
        @apply="handleApplyFilters"
        @reset="handleResetFilters"
      />
    </UCard>

    <!-- Table Card -->
    <UCard>
      <TablesCandidatesTable
        :candidates="candidates"
        :loading="loading"
        :error="error"
        @view-detail="handleViewDetail"
        @edit="handleEdit"
        @invite="handleInvite"
        @delete="handleDelete"
        @match-jobs="handleMatchJobs"
        @bulk-invite="handleBulkInvite"
        @bulk-delete="handleBulkDelete"
        @bulk-match-jobs="handleBulkMatchJobs"
      />
    </UCard>

    <!-- Create Modal -->
    <ModalsCreateCandidateModal
      v-model="showCreateModal"
      @submit="handleCreateCandidate"
    />

    <!-- Edit Modal -->
    <ModalsCreateCandidateModal
      v-model="showEditModal"
      :candidate="selectedCandidate"
      @submit="handleUpdateCandidate"
    />
  </div>
</template>

<script setup lang="ts">
import type { Candidate, CreateCandidateInput } from '@candidate/types/candidate'
import { useCandidateList } from '@candidate/composables/use-candidate-list'
import { useCandidateFilters } from '@candidate/composables/use-candidate-filters'
import { useCandidate } from '@candidate/utils/candidate-api'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()

definePageMeta({
  layout: 'dashboard',
  middleware: '01-auth',
})

// Layer 2: Shared composable for candidate list state
const {
  candidates,
  loading,
  error,
  fetchCandidates,
  addCandidate,
  updateCandidateInList,
  removeCandidate,
  removeCandidates,
} = useCandidateList()

// Layer 3: Query params for filters
const { filters, updateFilters, resetFilters } = useCandidateFilters()

// Layer 4: Component-local UI state
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedCandidate = ref<Candidate | null>(null)

// Track if initial load is done to avoid double fetch
const isInitialLoad = ref(true)

// Load candidates on mount
onMounted(async () => {
  await loadCandidates()
  isInitialLoad.value = false
})

// Watch filters and reload when they change (but not on initial load)
watch(filters, async (newFilters) => {
  if (isInitialLoad.value) return
  await fetchCandidates(newFilters)
}, { deep: true })

const loadCandidates = async () => {
  try {
    // Server handles all filtering based on query params
    await fetchCandidates(filters.value)
  } catch (err) {
    toast.add({
      title: t('candidate.error.load-failed'),
      description: error.value || t('candidate.error.load-failed-description'),
      color: 'error',
    })
  }
}

const handleApplyFilters = () => {
  // Filters are synced with URL automatically via useCandidateFilters
  // The watch will automatically reload candidates when filters change
}

const handleResetFilters = () => {
  resetFilters()
  // Filters reset will trigger watch and reload automatically
}

const handleCreateCandidate = async (input: CreateCandidateInput) => {
  const candidateOps = useCandidate()
  try {
    const newCandidate = await candidateOps.createCandidate(input)
    // Optimistically add to list
    addCandidate(newCandidate)
    toast.add({
      title: t('candidate.success.create-success'),
      description: t('candidate.success.create-success-description'),
      color: 'success',
    })
    showCreateModal.value = false
    // Optionally refresh to get server state
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

const handleEdit = (candidate: Candidate) => {
  selectedCandidate.value = candidate
  showEditModal.value = true
}

const handleUpdateCandidate = async (input: CreateCandidateInput) => {
  if (!selectedCandidate.value?.id) return

  const candidateOps = useCandidate()
  try {
    const updatedCandidate = await candidateOps.updateCandidate(selectedCandidate.value.id, input)
    // Optimistically update in list
    updateCandidateInList(updatedCandidate)
    toast.add({
      title: t('candidate.success.update-success'),
      description: t('candidate.success.update-success-description'),
      color: 'success',
    })
    showEditModal.value = false
    selectedCandidate.value = null
    // Optionally refresh to get server state
    await loadCandidates()
  } catch (error) {
    toast.add({
      title: t('candidate.error.update-failed'),
      description: t('candidate.error.update-failed-description'),
      color: 'error',
    })
  }
}

const handleInvite = async (candidate: Candidate) => {
  const candidateOps = useCandidate()
  try {
    if (!candidate.id) return
    await candidateOps.inviteCandidate(candidate.id)
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
  
  const candidateOps = useCandidate()
  // TODO: Add confirmation dialog
  try {
    await candidateOps.deleteCandidate(candidate.id)
    // Optimistically remove from list
    removeCandidate(candidate.id)
    toast.add({
      title: t('candidate.success.delete-success'),
      description: t('candidate.success.delete-success-description'),
      color: 'success',
    })
    // Optionally refresh to sync with server
    await loadCandidates()
  } catch (error) {
    // Check if error is about open applications
    const errorMessage = error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : ''
    
    const hasOpenApplications = errorMessage.toLowerCase().includes('open application')
    
    toast.add({
      title: hasOpenApplications
        ? t('candidate.error.delete-failed-open-applications')
        : t('candidate.error.delete-failed'),
      description: hasOpenApplications
        ? errorMessage || t('candidate.error.delete-failed-open-applications-description')
        : t('candidate.error.delete-failed-description'),
      color: 'error',
    })
  }
}

const handleBulkInvite = async (candidateIds: string[]) => {
  const candidateOps = useCandidate()
  try {
    await Promise.all(candidateIds.map(id => candidateOps.inviteCandidate(id)))
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

const handleMatchJobs = (candidate: Candidate) => {
  // Navigate to matching page with prefill candidate
  router.push({
    path: '/matching',
    query: {
      prefill: 'candidate',
      candidateId: candidate.id,
    },
  })
}

const handleBulkDelete = async (candidateIds: string[]) => {
  const candidateOps = useCandidate()
  // TODO: Add confirmation dialog
  try {
    // Use Promise.allSettled to handle partial failures
    const results = await Promise.allSettled(
      candidateIds.map(id => candidateOps.deleteCandidate(id))
    )
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    if (failed > 0) {
      // Check if any failures are due to open applications
      const openAppErrors = results.filter(
        r => r.status === 'rejected' 
          && r.reason 
          && typeof r.reason === 'object' 
          && 'message' in r.reason
          && String(r.reason.message).toLowerCase().includes('open application')
      )
      
      if (openAppErrors.length > 0) {
        toast.add({
          title: t('candidate.error.bulk-delete-failed'),
          description: t('candidate.error.delete-failed-open-applications-description'),
          color: 'error',
        })
      } else {
        toast.add({
          title: t('candidate.error.bulk-delete-failed'),
          description: t('candidate.error.bulk-delete-failed-description'),
          color: 'error',
        })
      }
      
      // Remove only successfully deleted candidates
      const successfulIds = candidateIds.filter((_, index) => results[index].status === 'fulfilled')
      if (successfulIds.length > 0) {
        removeCandidates(successfulIds)
        await loadCandidates()
      }
    } else {
      // All succeeded
      removeCandidates(candidateIds)
      toast.add({
        title: t('candidate.success.bulk-delete-success'),
        description: t('candidate.success.bulk-delete-success-description', { count: candidateIds.length }),
        color: 'success',
      })
      await loadCandidates()
    }
  } catch (error) {
    toast.add({
      title: t('candidate.error.bulk-delete-failed'),
      description: t('candidate.error.bulk-delete-failed-description'),
      color: 'error',
    })
  }
}

const handleBulkMatchJobs = (candidateIds: string[]) => {
  // Navigate to matching page with prefill candidates (use first candidate for now)
  if (candidateIds.length > 0) {
    router.push({
      path: '/matching',
      query: {
        prefill: 'candidate',
        candidateId: candidateIds[0],
      },
    })
  }
}
</script>
