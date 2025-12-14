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

const { t } = useI18n()

interface Props {
  currentStep: number
}

interface Emits {
  (e: 'update:currentStep', value: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const stepperItems = computed<StepperItem[]>(() => [
  {
    title: t('matching.stepper.job-information'),
    description: t('matching.stepper.job-information-desc'),
    icon: 'i-lucide-briefcase',
  },
  {
    title: t('matching.stepper.candidates'),
    description: t('matching.stepper.candidates-desc'),
    icon: 'i-lucide-users',
  },
  {
    title: t('matching.stepper.ai-analysis'),
    description: t('matching.stepper.ai-analysis-desc'),
    icon: 'i-lucide-brain',
  },
  {
    title: t('matching.stepper.results'),
    description: t('matching.stepper.results-desc'),
    icon: 'i-lucide-list-checks',
  },
])

const handleStepChange = (value: string | number | undefined) => {
  if (typeof value === 'number') {
    emit('update:currentStep', value + 1)
  }
}
</script>

