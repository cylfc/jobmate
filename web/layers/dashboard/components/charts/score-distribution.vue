<template>
  <ChartsBarChart
    :items="barChartItems"
    :height="height"
    :y-axis-max="100"
    :value-formatter="valueFormatter"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MatchScoreDistributionBin } from '../../types/dashboard'
import type { BarChartItem } from './bar-chart.vue'

const props = withDefaults(
  defineProps<{
    bins?: MatchScoreDistributionBin[]
    /**
     * CSS height value, e.g. "208px"
     */
    height?: string
  }>(),
  {
    bins: () => [],
    height: '208px',
  }
)

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0)

const barChartItems = computed<BarChartItem[]>(() => {
  return props.bins.map((bin) => ({
    label: bin.label,
    value: Math.round(clamp01(bin.ratio) * 100),
  }))
})

const valueFormatter = (value: number) => `${value}%`
</script>


