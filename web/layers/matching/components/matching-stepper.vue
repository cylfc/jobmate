<template>
  <UStepper
    class="w-full"
    disabled
    :items="stepperItems"
    :model-value="currentStep - 1"
    @update:model-value="handleStepChange"
  />
</template>

<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'

interface Props {
  currentStep: number
}

interface Emits {
  (e: 'update:currentStep', value: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const stepperItems = ref<StepperItem[]>([
  {
    title: 'Job Information',
    description: 'Enter job details',
    icon: 'i-lucide-briefcase',
  },
  {
    title: 'Candidates',
    description: 'Upload or select CVs',
    icon: 'i-lucide-users',
  },
  {
    title: 'AI Analysis',
    description: 'Analyzing matches',
    icon: 'i-lucide-brain',
  },
  {
    title: 'Results',
    description: 'View matching results',
    icon: 'i-lucide-list-checks',
  },
])

const handleStepChange = (value: string | number | undefined) => {
  if (typeof value === 'number') {
    emit('update:currentStep', value + 1)
  }
}
</script>

