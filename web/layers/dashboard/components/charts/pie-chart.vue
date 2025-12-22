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
  CHART_SERIES_TYPE,
  TOOLTIP_TRIGGER,
  LEGEND_ORIENT,
  LEGEND_POSITION,
  CHART_COLORS,
  CHART_DIMENSIONS,
  CHART_TYPOGRAPHY,
  CHART_BORDER_RADIUS,
  CHART_RADIUS,
  PIE_CHART_COLORS,
} from '../../constants/chart'

type ECOption = ComposeOption<BarSeriesOption | LineSeriesOption | PieSeriesOption | TooltipComponentOption | LegendComponentOption | GridComponentOption>

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
    height: CHART_DIMENSIONS.DEFAULT_HEIGHT,
    donut: false,
    donutRadius: () => [CHART_RADIUS.DONUT_INNER, CHART_RADIUS.DONUT_OUTER],
    showLabel: true,
    showLegend: true,
    legendPosition: 'bottom',
  }
)

const option = computed<ECOption>(() => {
  const total = props.items.reduce((sum, item) => sum + item.value, 0)

  const seriesData = props.items.map((item, idx) => ({
    name: item.name,
    value: item.value,
    itemStyle: {
      color: item.color ?? PIE_CHART_COLORS[idx % PIE_CHART_COLORS.length],
    },
  }))

  const legendConfig = props.showLegend
    ? {
        show: true,
        orient: (props.legendPosition === 'left' || props.legendPosition === 'right'
          ? LEGEND_ORIENT.VERTICAL
          : LEGEND_ORIENT.HORIZONTAL) as 'vertical' | 'horizontal',
        left:
          props.legendPosition === 'left'
            ? LEGEND_POSITION.LEFT
            : props.legendPosition === 'right'
              ? LEGEND_POSITION.RIGHT
              : LEGEND_POSITION.CENTER,
        top:
          props.legendPosition === 'top'
            ? LEGEND_POSITION.TOP
            : props.legendPosition === 'bottom'
              ? LEGEND_POSITION.BOTTOM
              : LEGEND_POSITION.MIDDLE,
        textStyle: { fontSize: CHART_TYPOGRAPHY.FONT_SIZE_SMALL },
      }
    : { show: false }

  return {
    tooltip: {
      trigger: TOOLTIP_TRIGGER.ITEM,
      formatter: (params: any) => {
        const percent = total > 0 ? ((params.value / total) * 100).toFixed(1) : '0'
        return `${params.name}<br/>${params.value} (${percent}%)`
      },
    },
    legend: legendConfig,
    series: [
      {
        type: CHART_SERIES_TYPE.PIE,
        radius: props.donut ? props.donutRadius : [CHART_RADIUS.PIE_START, CHART_RADIUS.DONUT_OUTER],
        center: [CHART_RADIUS.CENTER, CHART_RADIUS.CENTER],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: CHART_BORDER_RADIUS.PIE,
          borderColor: CHART_COLORS.WHITE,
          borderWidth: CHART_BORDER_RADIUS.PIE_BORDER_WIDTH,
        },
        label: props.showLabel
          ? {
              show: true,
              formatter: (params: any) => {
                const percent = total > 0 ? ((params.value / total) * 100).toFixed(0) : '0'
                return `${params.name}\n${percent}%`
              },
              fontSize: CHART_TYPOGRAPHY.FONT_SIZE_SMALL,
            }
          : { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: CHART_TYPOGRAPHY.FONT_SIZE_MEDIUM,
            fontWeight: 'bold',
          },
        },
        data: seriesData,
      },
    ],
  }
})
</script>

