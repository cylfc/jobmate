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
  SYMBOL_TYPE,
  CHART_COLORS,
  CHART_DIMENSIONS,
  CHART_GRID,
  CHART_TYPOGRAPHY,
  CHART_CALCULATION,
  CHART_GRADIENT,
  DEFAULT_CHART_COLORS,
} from '../../constants/chart'

type ECOption = ComposeOption<BarSeriesOption | LineSeriesOption | PieSeriesOption | TooltipComponentOption | LegendComponentOption | GridComponentOption>

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
    height: CHART_DIMENSIONS.DEFAULT_HEIGHT,
    area: false,
    yAxisMax: undefined,
    valueFormatter: (v: number) => String(v),
  }
)

const option = computed(() => {
  let xAxisLabels: string[] = []
  let seriesData: LineChartSeries[] = []

  if (props.items.length > 0) {
    xAxisLabels = props.items.map((item) => item.label)
    // Convert items format to series format
    const seriesCount = props.items[0]?.values.length ?? 0
    seriesData = Array.from({ length: seriesCount }, (_, idx) => ({
      name: `Series ${idx + 1}`,
      data: props.items.map((item) => item.values[idx] ?? 0),
      color: DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length],
    }))
  } else if (props.series.length > 0 && props.labels.length > 0) {
    xAxisLabels = props.labels
    seriesData = props.series.map((s, idx) => ({
      ...s,
      color: s.color ?? DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length],
    }))
  }

  const allValues = seriesData.flatMap((s) => s.data)
  const maxValue = props.yAxisMax ?? Math.max(...allValues, 0) * CHART_CALCULATION.MAX_VALUE_MULTIPLIER

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
      data: xAxisLabels,
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
      valueFormatter: ((value: any, dataIndex: number) => {
        const numValue = Array.isArray(value) ? value[0] : value
        return props.valueFormatter(typeof numValue === 'number' ? numValue : 0)
      }) as any,
    },
    legend: seriesData.length > 1
      ? { show: true, top: 0, textStyle: { fontSize: CHART_TYPOGRAPHY.FONT_SIZE_SMALL } }
      : { show: false },
    series: seriesData.map((s) => {
      const color = s.color || DEFAULT_CHART_COLORS[0]
      return {
        name: s.name,
        type: CHART_SERIES_TYPE.LINE,
        data: s.data,
        smooth: true,
        symbol: SYMBOL_TYPE.CIRCLE,
        symbolSize: CHART_DIMENSIONS.SYMBOL_SIZE,
        lineStyle: { color, width: CHART_DIMENSIONS.LINE_WIDTH },
        itemStyle: { color },
        areaStyle: props.area
          ? {
              color: {
                type: 'linear',
                x: CHART_GRADIENT.LINEAR_X,
                y: CHART_GRADIENT.LINEAR_Y,
                x2: CHART_GRADIENT.LINEAR_X2,
                y2: CHART_GRADIENT.LINEAR_Y2,
                colorStops: [
                  { offset: CHART_GRADIENT.COLOR_STOP_START, color },
                  { offset: CHART_GRADIENT.COLOR_STOP_END, color: CHART_COLORS.TRANSPARENT },
                ],
              },
            }
          : undefined,
      }
    }),
  } as ECOption
}) as any
</script>

