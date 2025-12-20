<template>
  <div v-if="showPurposeButtons" class="flex justify-center items-start flex-wrap gap-2">
    <UButton
      :variant="selectedPurpose === 'matching' ? 'solid' : 'outline'"
      :color="selectedPurpose === 'matching' ? 'primary' : 'neutral'"
      size="sm"
      @click="handleSelect('matching')"
    >
      <template #leading>
        <UIcon name="i-lucide-users" />
      </template>
      {{ t('chat.purpose.matching', { defaultValue: 'Matching' }) }}
    </UButton>
    <UButton
      :variant="selectedPurpose === 'create-candidate' ? 'solid' : 'outline'"
      :color="selectedPurpose === 'create-candidate' ? 'primary' : 'neutral'"
      size="sm"
      @click="handleSelect('create-candidate')"
    >
      <template #leading>
        <UIcon name="i-lucide-user-plus" />
      </template>
      {{ t('chat.purpose.create-candidate', { defaultValue: 'Tạo ứng viên' }) }}
    </UButton>
    <UButton
      :variant="selectedPurpose === 'create-job' ? 'solid' : 'outline'"
      :color="selectedPurpose === 'create-job' ? 'primary' : 'neutral'"
      size="sm"
      @click="handleSelect('create-job')"
    >
      <template #leading>
        <UIcon name="i-lucide-briefcase" />
      </template>
      {{ t('chat.purpose.create-job', { defaultValue: 'Tạo JD' }) }}
    </UButton>
    <UButton
      :variant="selectedPurpose === 'general' ? 'solid' : 'outline'"
      :color="selectedPurpose === 'general' ? 'primary' : 'neutral'"
      size="sm"
      @click="handleSelect('general')"
    >
      <template #leading>
        <UIcon name="i-lucide-message-circle" />
      </template>
      {{ t('chat.purpose.general', { defaultValue: 'Tổng quát' }) }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { ChatFeature } from '@chat/types/chat'

const { t } = useI18n()

interface Props {
  /**
   * Whether to show purpose buttons
   * @default true
   */
  showPurposeButtons?: boolean
  /**
   * Currently selected purpose
   */
  selectedPurpose?: ChatFeature
}

interface Emits {
  (e: 'select', purpose: ChatFeature): void
}

const props = withDefaults(defineProps<Props>(), {
  showPurposeButtons: true,
  selectedPurpose: 'matching',
})

const emit = defineEmits<Emits>()

const handleSelect = (purpose: ChatFeature) => {
  emit('select', purpose)
}
</script>

