<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex items-center justify-center p-8">
      <UIcon name="i-lucide-loader" class="w-6 h-6 animate-spin text-primary" />
    </div>

    <div v-else-if="items.length === 0" class="text-center p-8 text-muted">
      <p>{{ $t('chat.components.source-table.no-data') }}</p>
    </div>

    <div v-else class="space-y-2 max-h-96 overflow-y-auto">
      <div
        v-for="item in items"
        :key="getItemId(item)"
        class="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-elevated transition-colors cursor-pointer"
        :class="{ 'ring-2 ring-primary': isSelected(item) }"
        @click="toggleItem(item)"
      >
        <div class="flex-1">
          <p class="font-medium">{{ getItemTitle(item) }}</p>
          <p class="text-sm text-muted">{{ getItemSubtitle(item) }}</p>
        </div>
        <UCheckbox
          :model-value="isSelected(item)"
          @update:model-value="toggleItem(item)"
          @click.stop
        />
      </div>
    </div>

    <UButton
      v-if="selectedItems.length > 0"
      color="primary"
      block
      @click="handleConfirm"
    >
      {{ $t('chat.components.source-table.confirm', { count: selectedItems.length }) }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useMatchingJob } from '@matching/composables/use-matching-job'
import { useMatchingCandidate } from '@matching/composables/use-matching-candidate'

interface Props {
  type: 'job' | 'candidate'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update', data: { items: any[] }): void
}>()

const jobOps = useMatchingJob()
const candidateOps = useMatchingCandidate()

const loading = ref(true)
const items = ref<any[]>([])
const selectedItems = ref<any[]>([])

const isSelected = (item: any) => {
  return selectedItems.value.some((selected) => getItemId(selected) === getItemId(item))
}

const getItemId = (item: any) => {
  return item.id || item.value || JSON.stringify(item)
}

const { t } = useI18n()

const getItemTitle = (item: any) => {
  if (props.type === 'job') {
    return item.title || item.label || t('chat.components.source-table.untitled-job')
  }
  return `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name || item.label || t('chat.components.source-table.unknown')
}

const getItemSubtitle = (item: any) => {
  if (props.type === 'job') {
    return item.company || item.description?.substring(0, 50) || ''
  }
  return item.email || item.description?.substring(0, 50) || ''
}

const toggleItem = (item: any) => {
  const index = selectedItems.value.findIndex((selected) => getItemId(selected) === getItemId(item))
  if (index >= 0) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(item)
  }
}

const handleConfirm = () => {
  emit('update', { items: selectedItems.value })
}

onMounted(async () => {
  loading.value = true
  try {
    if (props.type === 'job') {
      items.value = await jobOps.getJobsFromDatabase()
    } else {
      items.value = await candidateOps.getCandidatesFromDatabase()
    }
  } catch (error) {
    console.error('Error loading items:', error)
  } finally {
    loading.value = false
  }
})
</script>

