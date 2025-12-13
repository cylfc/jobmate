<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold mb-2">Step 3: AI Analysis</h2>
      <p class="text-gray-600">Analyzing job-candidate matches</p>
    </div>

    <div v-if="isAnalyzing" class="space-y-4">
      <div class="p-6 bg-gray-50 rounded-lg">
        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <p class="text-sm font-medium">Processing Data</p>
              <span class="text-sm text-gray-500">{{ analysisProgress }}%</span>
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
                  step.completed ? 'text-green-500' : step.active ? 'text-primary-500 animate-spin' : 'text-gray-300',
                  'w-5 h-5'
                ]"
              />
              <span
                :class="step.completed ? 'text-gray-900' : step.active ? 'text-primary-600' : 'text-gray-400'"
              >
                {{ step.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="analysisComplete" class="p-6 bg-green-50 rounded-lg">
      <div class="flex items-center gap-2 mb-4">
        <UIcon name="i-lucide-check-circle" class="w-6 h-6 text-green-500" />
        <p class="text-lg font-semibold text-green-900">Analysis Complete!</p>
      </div>
      <p class="text-sm text-green-700">
        Found {{ matchingsCount }} matching candidates
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
        Previous
      </UButton>
      <UButton
        v-if="analysisComplete"
        color="primary"
        icon="i-lucide-arrow-right"
        @click="$emit('next')"
      >
        View Results
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const analysisSteps = ref([
  { label: 'Extracting data from job description', completed: false, active: false },
  { label: 'Processing candidate CVs', completed: false, active: false },
  { label: 'Calculating match scores', completed: false, active: false },
  { label: 'Generating analysis report', completed: false, active: false },
])

const analysisComplete = computed(() => {
  return !props.isAnalyzing && props.analysisProgress === 100
})

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

