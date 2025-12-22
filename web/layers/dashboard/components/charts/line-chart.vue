<template>
  <ClientOnly>
    <VChart class="w-full" :style="{ height }" :option="option" autoresize />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface LineChartSeries {
  name: string
  data: number[]
  color?: string
}

export interface LineChartItem {
  label: string
  values: number[]
}

const props = withDefaults(
  defineProps<{
    /**
     * Data format: array of { label, values[] }
     * If multiple series, values array length should match series count
     */
    items?: LineChartItem[]
    /**
     * Series configuration (alternative to items format)
     */
    series?: LineChartSeries[]
    /**
     * X-axis labels (required if using series prop)
     */
    labels?: string[]
    /**
     * CSS height value, e.g. "300px"
     */
    height?: string
    /**
     * Show area under line
     */
    area?: boolean
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
    series: () => [],
    labels: () => [],
    height: '300px',
    area: false,
    yAxisMax: undefined,
    valueFormatter: (v: number) => String(v),
  }
)

const defaultColors = [
  '#c6613f',
  'var(--color-sky-500)',
  'var(--color-emerald-500)',
  'var(--color-amber-500)',
  'var(--color-rose-500)',
]

const option = computed<ECOption>(() => {
  let xAxisLabels: string[] = []
  let seriesData: LineChartSeries[] = []

  if (props.items.length > 0) {
    xAxisLabels = props.items.map((item) => item.label)
    // Convert items format to series format
    const seriesCount = props.items[0]?.values.length ?? 0
    seriesData = Array.from({ length: seriesCount }, (_, idx) => ({
      name: `Series ${idx + 1}`,
      data: props.items.map((item) => item.values[idx] ?? 0),
      color: defaultColors[idx % defaultColors.length],
    }))
  } else if (props.series.length > 0 && props.labels.length > 0) {
    xAxisLabels = props.labels
    seriesData = props.series.map((s, idx) => ({
      ...s,
      color: s.color ?? defaultColors[idx % defaultColors.length],
    }))
  }

  const allValues = seriesData.flatMap((s) => s.data)
  const maxValue = props.yAxisMax ?? Math.max(...allValues, 0) * 1.1

  return {
    grid: { left: 12, right: 12, top: 10, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: xAxisLabels,
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
      valueFormatter: props.valueFormatter,
    },
    legend: seriesData.length > 1 ? { show: true, top: 0, textStyle: { fontSize: 11 } } : { show: false },
    series: seriesData.map((s) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: s.color, width: 2 },
      itemStyle: { color: s.color },
      areaStyle: props.area
        ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: s.color },
                { offset: 1, color: 'transparent' },
              ],
            },
          }
        : undefined,
    })),
  }
})
</script>

