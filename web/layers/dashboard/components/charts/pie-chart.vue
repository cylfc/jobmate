<template>
  <ClientOnly>
    <VChart class="w-full" :style="{ height }" :option="option" autoresize />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface PieChartItem {
  name: string
  value: number
  color?: string
}

const props = withDefaults(
  defineProps<{
    items?: PieChartItem[]
    /**
     * CSS height value, e.g. "300px"
     */
    height?: string
    /**
     * Show as donut chart (with center hole)
     */
    donut?: boolean
    /**
     * Donut inner radius (0-1, only used if donut=true)
     */
    donutRadius?: [string, string]
    /**
     * Show labels on chart
     */
    showLabel?: boolean
    /**
     * Show legend
     */
    showLegend?: boolean
    /**
     * Legend position
     */
    legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  }>(),
  {
    items: () => [],
    height: '300px',
    donut: false,
    donutRadius: () => ['40%', '70%'],
    showLabel: true,
    showLegend: true,
    legendPosition: 'bottom',
  }
)

const defaultColors = [
  '#d68d67',
  'var(--color-sky-500)',
  'var(--color-emerald-500)',
  'var(--color-amber-500)',
  'var(--color-rose-500)',
  'var(--color-purple-500)',
  'var(--color-indigo-500)',
]

const option = computed<ECOption>(() => {
  const total = props.items.reduce((sum, item) => sum + item.value, 0)

  const seriesData = props.items.map((item, idx) => ({
    name: item.name,
    value: item.value,
    itemStyle: {
      color: item.color ?? defaultColors[idx % defaultColors.length],
    },
  }))

  const legendConfig = props.showLegend
    ? {
        show: true,
        orient: props.legendPosition === 'left' || props.legendPosition === 'right' ? 'vertical' : 'horizontal',
        left: props.legendPosition === 'left' ? 'left' : props.legendPosition === 'right' ? 'right' : 'center',
        top: props.legendPosition === 'top' ? 'top' : props.legendPosition === 'bottom' ? 'bottom' : 'middle',
        textStyle: { fontSize: 11 },
      }
    : { show: false }

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const percent = total > 0 ? ((params.value / total) * 100).toFixed(1) : '0'
        return `${params.name}<br/>${params.value} (${percent}%)`
      },
    },
    legend: legendConfig,
    series: [
      {
        type: 'pie',
        radius: props.donut ? props.donutRadius : ['0%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: props.showLabel
          ? {
              show: true,
              formatter: (params: any) => {
                const percent = total > 0 ? ((params.value / total) * 100).toFixed(0) : '0'
                return `${params.name}\n${percent}%`
              },
              fontSize: 11,
            }
          : { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
          },
        },
        data: seriesData,
      },
    ],
  }
})
</script>

