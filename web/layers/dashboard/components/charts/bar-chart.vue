<template>
  <ClientOnly>
    <VChart class="w-full" :style="{ height }" :option="option" autoresize />
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
  TOOLTIP_TRIGGER,
  AXIS_POINTER_TYPE,
  CHART_COLORS,
  CHART_DIMENSIONS,
  CHART_GRID,
  CHART_TYPOGRAPHY,
  CHART_BORDER_RADIUS,
  CHART_CALCULATION,
} from '../../constants/chart'

type ECOption = ComposeOption<BarSeriesOption | LineSeriesOption | PieSeriesOption | TooltipComponentOption | LegendComponentOption | GridComponentOption>

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
    height: CHART_DIMENSIONS.DEFAULT_HEIGHT,
    color: CHART_COLORS.BRAND_500,
    horizontal: false,
    yAxisMax: undefined,
    valueFormatter: (v: number) => String(v),
  }
)

const option = computed(() => {
  const labels = props.items.map((item) => item.label)
  const values = props.items.map((item) => item.value)

  const maxValue = props.yAxisMax ?? Math.max(...values, 0) * CHART_CALCULATION.MAX_VALUE_MULTIPLIER

  if (props.horizontal) {
    return {
      grid: {
        left: CHART_GRID.LEFT_LARGE,
        right: CHART_GRID.RIGHT,
        top: CHART_GRID.TOP,
        bottom: CHART_GRID.BOTTOM,
        containLabel: true,
      },
      xAxis: {
        type: CHART_AXIS_TYPE.VALUE,
        max: maxValue,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: CHART_COLORS.SPLIT_LINE } },
        axisLabel: {
          color: CHART_COLORS.GRAY_500,
          fontSize: CHART_TYPOGRAPHY.FONT_SIZE_SMALL,
          formatter: props.valueFormatter,
        },
      },
      yAxis: {
        type: CHART_AXIS_TYPE.CATEGORY,
        data: labels,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: CHART_COLORS.GRAY_500, fontSize: CHART_TYPOGRAPHY.FONT_SIZE_SMALL },
      },
      tooltip: {
        trigger: TOOLTIP_TRIGGER.AXIS,
        axisPointer: { type: AXIS_POINTER_TYPE.SHADOW },
        valueFormatter: ((value: any, dataIndex: number) => {
          const numValue = Array.isArray(value) ? value[0] : value
          return props.valueFormatter(typeof numValue === 'number' ? numValue : 0)
        }) as any,
      },
      series: [
        {
          type: CHART_SERIES_TYPE.BAR,
          data: values,
          barMaxWidth: CHART_DIMENSIONS.BAR_MAX_WIDTH,
          itemStyle: {
            color: props.color,
            borderRadius: CHART_BORDER_RADIUS.BAR_HORIZONTAL,
          },
        },
      ],
    } as ECOption
  }

  return {
    grid: {
      left: CHART_GRID.LEFT_SMALL,
      right: CHART_GRID.RIGHT,
      top: CHART_GRID.TOP,
      bottom: CHART_GRID.BOTTOM,
      containLabel: true,
    },
    xAxis: {
      type: CHART_AXIS_TYPE.CATEGORY,
      data: labels,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: CHART_COLORS.GRAY_500, fontSize: CHART_TYPOGRAPHY.FONT_SIZE_SMALL },
    },
    yAxis: {
      type: CHART_AXIS_TYPE.VALUE,
      max: maxValue,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: CHART_COLORS.SPLIT_LINE } },
      axisLabel: {
        color: CHART_COLORS.GRAY_500,
        fontSize: CHART_TYPOGRAPHY.FONT_SIZE_SMALL,
        formatter: props.valueFormatter,
      },
    },
    tooltip: {
      trigger: TOOLTIP_TRIGGER.AXIS,
      axisPointer: { type: AXIS_POINTER_TYPE.SHADOW },
      valueFormatter: ((value: any, dataIndex: number) => {
        const numValue = Array.isArray(value) ? value[0] : value
        return props.valueFormatter(typeof numValue === 'number' ? numValue : 0)
      }) as any,
    },
    series: [
      {
        type: CHART_SERIES_TYPE.BAR,
        data: values,
        barMaxWidth: CHART_DIMENSIONS.BAR_MAX_WIDTH,
        itemStyle: {
          color: props.color,
          borderRadius: CHART_BORDER_RADIUS.BAR_VERTICAL,
        },
      },
    ],
  } as ECOption
}) as any
</script>

