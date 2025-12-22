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
import type { ComposeOption } from 'echarts/core'
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts'
import type { TooltipComponentOption, LegendComponentOption, GridComponentOption } from 'echarts/components'
import {
  CHART_AXIS_TYPE,
  CHART_SERIES_TYPE,
  SYMBOL_TYPE,
  CHART_DIMENSIONS,
  CHART_GRID,
  CHART_CALCULATION,
  CSS_VAR_COLOR_MAP,
  CHART_COLORS,
} from '../../constants/chart'

type ECOption = ComposeOption<BarSeriesOption | LineSeriesOption | PieSeriesOption | TooltipComponentOption | LegendComponentOption | GridComponentOption>

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
    height: CHART_DIMENSIONS.SPARKLINE_HEIGHT,
    width: CHART_DIMENSIONS.DEFAULT_WIDTH,
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
  
  return CSS_VAR_COLOR_MAP[colorVar] || CHART_COLORS.BRAND_600
}

// Convert hex color to rgba with opacity
const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
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
      top: CHART_GRID.SPARKLINE_TOP,
      bottom: CHART_GRID.SPARKLINE_BOTTOM,
      containLabel: false,
    },
    xAxis: {
      type: CHART_AXIS_TYPE.CATEGORY,
      data: Array.from({ length: values.length }, (_, i) => i),
      show: false,
    },
    yAxis: {
      type: CHART_AXIS_TYPE.VALUE,
      min: min - range * CHART_CALCULATION.SPARKLINE_RANGE_MULTIPLIER,
      max: max + range * CHART_CALCULATION.SPARKLINE_RANGE_MULTIPLIER,
      show: false,
    },
    tooltip: {
      show: false,
    },
    series: [
      {
        type: CHART_SERIES_TYPE.LINE,
        data: values,
        smooth: true,
        symbol: SYMBOL_TYPE.NONE,
        lineStyle: {
          color: actualColor,
          width: CHART_DIMENSIONS.LINE_WIDTH,
        },
        areaStyle: props.area
          ? {
              color: hexToRgba(actualColor, CHART_CALCULATION.AREA_OPACITY),
            }
          : undefined,
      },
    ],
  }
})
</script>

