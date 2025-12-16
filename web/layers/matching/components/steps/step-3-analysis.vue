<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold mb-2">{{ t('matching.step-3.title') }}</h2>
      <p class="text-muted">{{ t('matching.step-3.description') }}</p>
    </div>

    <div v-if="isAnalyzing" class="space-y-4">
      <div class="p-6 bg-muted rounded-lg">
        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-medium">{{ t('matching.step-3.processing-data') }}</p>
              <span class="text-sm text-muted">{{ analysisProgress }}%</span>
            </div>
            <UProgress :value="analysisProgress" :max="100" />
          </div>

          <div class="space-y-2">
            <div
              v-for="(step, index) in analysisSteps"
              :key="index"
              class="flex items-center gap-2"
            >
              <UIcon
                :name="step.completed ? 'i-lucide-check-circle' : step.active ? 'i-lucide-loader-2' : 'i-lucide-circle'"
                :class="[
                  step.completed ? 'text-success' : step.active ? 'text-primary animate-spin' : 'text-dimmed',
                  'w-5 h-5'
                ]"
              />
              <span
                :class="step.completed ? 'text-default' : step.active ? 'text-primary' : 'text-dimmed'"
              >
                {{ step.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="analysisComplete" class="p-6 bg-success/10 rounded-lg border border-success/20">
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-success" />
        <p class="text-lg font-semibold text-success">{{ t('matching.step-3.analysis-complete') }}</p>
      </div>
      <p class="text-sm text-success/80">
        {{ t('matching.step-3.found-matching', { count: matchingsCount }) }}
      </p>
    </div>

    <USeparator class="my-4" />

    <div class="flex items-center justify-between">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-arrow-left"
        @click="$emit('previous')"
      >
        {{ t('matching.step-3.previous') }}
      </UButton>
      <UButton
        v-if="analysisComplete"
        color="primary"
        icon="i-lucide-arrow-right"
        @click="$emit('next')"
      >
        {{ t('matching.step-3.view-results') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

interface Props {
  isAnalyzing: boolean
  analysisProgress: number
  matchingsCount: number
}

interface Emits {
  (e: 'next'): void
  (e: 'previous'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const stepLabels = computed(() => [
  t('matching.step-3.extracting-data'),
  t('matching.step-3.processing-cvs'),
  t('matching.step-3.calculating-scores'),
  t('matching.step-3.generating-report'),
])

const analysisSteps = ref([
  { label: '', completed: false, active: false },
  { label: '', completed: false, active: false },
  { label: '', completed: false, active: false },
  { label: '', completed: false, active: false },
])

const analysisComplete = computed(() => {
  return !props.isAnalyzing && props.analysisProgress === 100
})

// Update labels when translation changes
watch(stepLabels, (labels) => {
  labels.forEach((label, index) => {
    if (analysisSteps.value[index]) {
      analysisSteps.value[index].label = label
    }
  })
}, { immediate: true })

watch(() => props.analysisProgress, (progress) => {
  const stepIndex = Math.floor((progress / 100) * analysisSteps.value.length)
  
  analysisSteps.value.forEach((step, index) => {
    if (index < stepIndex) {
      step.completed = true
      step.active = false
    } else if (index === stepIndex && progress < 100) {
      step.completed = false
      step.active = true
    } else {
      step.completed = false
      step.active = false
    }
  })
}, { immediate: true })
</script>

