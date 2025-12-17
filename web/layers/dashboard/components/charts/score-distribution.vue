<template>
  <ClientOnly>
    <VChart class="w-full" :style="{ height }" :option="option" autoresize />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MatchScoreDistributionBin } from '../../types/dashboard'

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

const option = computed<ECOption>(() => {
  const labels = props.bins.map((b) => b.label)
  const values = props.bins.map((b) => Math.round(clamp01(b.ratio) * 100))

  return {
    grid: { left: 12, right: 12, top: 10, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: labels,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.25)' } },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        formatter: (v: number) => `${v}%`,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (v: number) => `${v}%`,
    },
    series: [
      {
        type: 'bar',
        data: values,
        barMaxWidth: 32,
        itemStyle: {
          // Match Nuxt UI primary color (ui.colors.primary = "brand")
          color: 'var(--color-brand-500)',
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  }
})
</script>


