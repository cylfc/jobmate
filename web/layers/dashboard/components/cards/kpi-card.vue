<template>
  <UCard
    class="h-full cursor-pointer transition hover:shadow-md"
    :ui="{
      body: 'p-5',
    }"
    @click="handleClick"
  >
    <!-- Header: Title + "Last 7 days" -->
    <div class="flex items-center justify-between mb-4">
      <p class="text-xs font-semibold text-muted tracking-wide uppercase">
        {{ title }}
      </p>
      <p class="text-xs text-muted">Last 7 days</p>
    </div>

    <!-- Main Value -->
    <div class="mb-4">
      <USkeleton v-if="loading" class="h-10 w-32 mb-2" />
      <div v-else class="text-3xl font-bold text-default tabular-nums mb-3">
        {{ value }}
      </div>

      <!-- Sub-metric or Trend -->
      <div v-if="!loading" class="space-y-2">
        <!-- Sub-metric (e.g., "Conversion rate: 7%") -->
        <div v-if="subMetric" class="space-y-1.5">
          <div class="flex items-center justify-between">
            <p class="text-xs text-muted">{{ subMetric }}</p>
            <span class="text-xs font-medium" :class="subMetricColorClass">
              {{ subMetricValue }}
              <UIcon v-if="delta !== undefined" :name="deltaIcon" class="size-3 inline ml-0.5" />
            </span>
          </div>
          <!-- Progress bar for sub-metric -->
          <UProgress
            v-if="chartType === 'progress'"
            :value="progressValue"
            :max="100"
            :color="progressColor"
            size="sm"
          />
        </div>

        <!-- Trend badge (if no sub-metric) -->
        <div v-else-if="delta !== undefined" class="flex items-center gap-1">
          <span class="text-xs font-medium" :class="deltaColorClass">
            {{ formattedDelta }}
            <UIcon :name="deltaIcon" class="size-3 inline ml-0.5" />
          </span>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="!loading && trendData && trendData.length > 0" class="mt-4 h-16 -mx-6">
      <!-- Progress bar chart (already shown above, hide here) -->
      <template v-if="chartType === 'progress'">
        <!-- Progress already shown above -->
      </template>

      <!-- Line chart with area -->
      <ChartsSparklineChart
        v-else-if="chartType === 'line'"
        :data="trendData"
        :color="sparklineColor"
        height="64px"
        width="100%"
        :area="true"
      />

      <!-- Line chart with comparison -->
      <div v-else-if="chartType === 'line-compare' && compareData" class="h-full">
        <ChartsSparklineChart
          :data="trendData"
          :color="sparklineColor"
          height="64px"
          width="100%"
          :area="false"
        />
        <!-- TODO: Add comparison line overlay -->
      </div>

      <!-- Bar chart -->
      <ChartsBarChart
        v-else-if="chartType === 'bar'"
        :items="barChartItems"
        height="64px"
        :color="sparklineColor"
      />

      <!-- Default: Line chart -->
      <ChartsSparklineChart
        v-else
        :data="trendData"
        :color="sparklineColor"
        height="64px"
        width="100%"
        :area="true"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KpiChartType } from '../../types/dashboard'
import type { BarChartItem } from '../charts/bar-chart.vue'

const props = withDefaults(
  defineProps<{
    title: string
    value: number | string
    delta?: number
    icon?: string
    loading?: boolean
    trendData?: number[]
    chartType?: KpiChartType
    subMetric?: string
    subMetricValue?: string | number
    compareData?: number[]
  }>(),
  {
    delta: undefined,
    icon: undefined,
    loading: false,
    trendData: undefined,
    chartType: 'line',
    subMetric: undefined,
    subMetricValue: undefined,
    compareData: undefined,
  }
)

const emit = defineEmits<{
  (e: 'drilldown'): void
}>()

const clickable = computed(() => !props.loading)

const deltaColor = computed(() => {
  if (props.delta === undefined) return 'neutral'
  if (props.delta > 0) return 'success'
  if (props.delta < 0) return 'error'
  return 'neutral'
})

const deltaIcon = computed(() => {
  if (props.delta === undefined) return 'i-lucide-minus'
  if (props.delta > 0) return 'i-lucide-trending-up'
  if (props.delta < 0) return 'i-lucide-trending-down'
  return 'i-lucide-minus'
})

const formattedDelta = computed(() => {
  if (props.delta === undefined) return ''
  const sign = props.delta > 0 ? '+' : ''
  return `${sign}${props.delta}`
})

const handleClick = () => {
  if (!clickable.value) return
  emit('drilldown')
}

const sparklineColor = computed(() => {
  if (props.delta === undefined) return '#10b981' // emerald-500
  if (props.delta > 0) return '#10b981' // emerald-500
  if (props.delta < 0) return '#f43f5e' // rose-500
  return '#10b981'
})

const deltaColorClass = computed(() => {
  if (props.delta === undefined) return 'text-muted'
  if (props.delta > 0) return 'text-emerald-600'
  if (props.delta < 0) return 'text-rose-600'
  return 'text-amber-600'
})

const subMetricColorClass = computed(() => {
  if (props.delta === undefined) return 'text-emerald-600'
  if (props.delta > 0) return 'text-emerald-600'
  if (props.delta < 0) return 'text-rose-600'
  return 'text-amber-600'
})

const progressColor = computed(() => {
  if (props.delta === undefined) return 'success'
  if (props.delta > 0) return 'success'
  if (props.delta < 0) return 'error'
  return 'warning'
})

const progressValue = computed(() => {
  // For progress chart, use the main value as percentage
  if (typeof props.value === 'string') {
    const num = parseFloat(props.value.replace(/[^0-9.]/g, ''))
    return Number.isFinite(num) ? num : 0
  }
  // If value is already a number, assume it's a percentage
  return typeof props.value === 'number' ? props.value : 0
})

const barChartItems = computed<BarChartItem[]>(() => {
  if (!props.trendData || props.trendData.length === 0) return []
  return props.trendData.map((value, idx) => ({
    label: `Day ${idx + 1}`,
    value,
  }))
})
</script>


