<template>
  <ClientOnly>
    <VChart
      class="w-full"
      :style="{ height, width }"
      :option="option"
      autoresize
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /**
     * Array of numeric values to display as trend
     */
    data?: number[]
    /**
     * CSS height value, e.g. "40px"
     */
    height?: string
    /**
     * CSS width value, e.g. "100px"
     */
    width?: string
    /**
     * Line color (CSS color value or CSS variable)
     */
    color?: string
    /**
     * Show area under line
     */
    area?: boolean
  }>(),
  {
    data: () => [],
    height: '40px',
    width: '100%',
    color: 'var(--color-brand-600)',
    area: true,
  }
)

// Convert CSS variable to actual color value
const getColorValue = (colorVar: string): string => {
  // If it's already a hex/rgb, return as is
  if (!colorVar.startsWith('var(--')) {
    return colorVar
  }
  
  // Map common CSS variables to actual colors (from main.css)
  const colorMap: Record<string, string> = {
    'var(--color-brand-600)': '#a84d2f',
    'var(--color-brand-500)': '#c6613f',
    'var(--color-emerald-500)': '#10b981',
    'var(--color-rose-500)': '#f43f5e',
  }
  
  return colorMap[colorVar] || '#a84d2f' // Default to brand-600
}

const option = computed<ECOption>(() => {
  const values = props.data.length > 0 ? props.data : [0]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  
  const actualColor = getColorValue(props.color)

  return {
    grid: {
      left: 0,
      right: 0,
      top: 2,
      bottom: 2,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: values.length }, (_, i) => i),
      show: false,
    },
    yAxis: {
      type: 'value',
      min: min - range * 0.1,
      max: max + range * 0.1,
      show: false,
    },
    tooltip: {
      show: false,
    },
    series: [
      {
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: actualColor,
          width: 2,
        },
        areaStyle: props.area
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: actualColor },
                  { offset: 1, color: 'transparent' },
                ],
              },
            }
          : undefined,
      },
    ],
  }
})
</script>

