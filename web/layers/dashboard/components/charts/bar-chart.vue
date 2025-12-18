<template>
  <ClientOnly>
    <VChart class="w-full" :style="{ height }" :option="option" autoresize />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface BarChartItem {
  label: string
  value: number
}

const props = withDefaults(
  defineProps<{
    items?: BarChartItem[]
    /**
     * CSS height value, e.g. "300px"
     */
    height?: string
    /**
     * Bar color (CSS color value or CSS variable)
     */
    color?: string
    /**
     * Show horizontal bar chart
     */
    horizontal?: boolean
    /**
     * Y-axis max value (auto if not provided)
     */
    yAxisMax?: number
    /**
     * Value formatter function
     */
    valueFormatter?: (value: number) => string
  }>(),
  {
    items: () => [],
    height: '300px',
    color: '#d68d67',
    horizontal: false,
    yAxisMax: undefined,
    valueFormatter: (v: number) => String(v),
  }
)

const option = computed<ECOption>(() => {
  const labels = props.items.map((item) => item.label)
  const values = props.items.map((item) => item.value)

  const maxValue = props.yAxisMax ?? Math.max(...values, 0) * 1.1

  if (props.horizontal) {
    return {
      grid: { left: 80, right: 12, top: 10, bottom: 24, containLabel: true },
      xAxis: {
        type: 'value',
        max: maxValue,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: 'rgba(148,163,184,0.25)' } },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          formatter: props.valueFormatter,
        },
      },
      yAxis: {
        type: 'category',
        data: labels,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#6b7280', fontSize: 11 },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: props.valueFormatter,
      },
      series: [
        {
          type: 'bar',
          data: values,
          barMaxWidth: 32,
          itemStyle: {
            color: props.color,
            borderRadius: [0, 6, 6, 0],
          },
        },
      ],
    }
  }

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
      max: maxValue,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.25)' } },
      axisLabel: {
        color: '#6b7280',
        fontSize: 11,
        formatter: props.valueFormatter,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: props.valueFormatter,
    },
    series: [
      {
        type: 'bar',
        data: values,
        barMaxWidth: 32,
        itemStyle: {
          color: props.color,
          borderRadius: [6, 6, 0, 0],
        },
      },
    ],
  }
})
</script>

