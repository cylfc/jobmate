<template>
  <div v-if="showPurposeButtons" class="flex justify-center items-start flex-wrap gap-2">
    <UButton
      v-for="purpose in purposes"
      :key="purpose.value"
      :variant="selectedPurpose === purpose.value ? 'solid' : 'outline'"
      :color="selectedPurpose === purpose.value ? 'primary' : 'neutral'"
      size="sm"
      class="rounded-full"
      @click="handleSelect(purpose.value)"
    >
      <template #leading>
        <UIcon :name="purpose.icon" />
      </template>
      {{ t(purpose.i18nKey, { defaultValue: purpose.label }) }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { ChatFeature } from '@chat/types/chat'

const { t } = useI18n()
const { purposes } = useChatSetup()

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

