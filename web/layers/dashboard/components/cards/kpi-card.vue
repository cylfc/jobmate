<template>
  <UCard
    class="h-full cursor-pointer transition hover:shadow-md"
    :ui="{
      body: 'sm:p-5 p-5 h-full flex flex-col justify-start items-stretch',
    }"
    @click="handleClick"
  >
    <!-- Header: Title + "Last 7 days" -->
    <div class="flex items-center justify-between">
      <p class="text-xs font-semibold text-muted tracking-wide uppercase">
        {{ title }}
      </p>
      <p class="text-xs text-muted uppercase">{{ KPI_LABELS.LAST_7_DAYS }}</p>
    </div>

    <!-- Main Value -->
    <div class="flex-1">
      <USkeleton v-if="loading" class="h-10 w-32 mb-2" />
      <div v-else class="text-3xl font-bold text-default tabular-nums ">
        {{ value }}
      </div>

      <!-- Sub-metric or Trend -->
      <div v-if="!loading" class="space-y-2">
        <!-- Sub-metric (e.g., "Conversion rate: 7%") -->
        <div v-if="subMetric" class="space-y-1.5">
          <div class="flex items-center justify-between">
            <p class="text-xs text-muted">{{ subMetric }}</p>
            <UBadge
              :color="deltaColor"
              variant="soft"
              size="xs"
              class="text-sm"
            >
              {{ subMetricValue }}
              <UIcon
                v-if="delta !== undefined"
                :name="deltaIcon"
                class="size-3 inline ml-0.5"
              />
            </UBadge>
          </div>
          <!-- Progress bar for sub-metric -->
          <UProgress
            v-if="chartType === 'progress'"
            :value="progressValue"
            :max="KPI_PROGRESS.MAX"
            :color="progressColor"
            size="sm"
          />
        </div>

        <!-- Trend badge (if no sub-metric) -->
        <div v-else-if="delta !== undefined" class="flex items-center gap-1">
          <UBadge :color="deltaColor" variant="soft" size="xs" class="text-sm">
            {{ formattedDelta }}
            <UIcon :name="deltaIcon" class="size-3 inline ml-0.5" />
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="!loading && trendData && trendData.length > 0" class="-mx-6">
      <!-- Progress bar chart (already shown above, hide here) -->
      <template v-if="chartType === 'progress'">
        <!-- Progress already shown above -->
      </template>

      <!-- Line chart with area -->
      <ChartsSparklineChart
        v-else-if="chartType === 'line'"
        :data="trendData"
        :color="sparklineColor"
        :height="KPI_CHART_DIMENSIONS.HEIGHT"
        :width="KPI_CHART_DIMENSIONS.WIDTH"
        :area="true"
      />

      <!-- Line chart with comparison -->
      <div
        v-else-if="chartType === 'line-compare' && compareData"
        class="h-full"
      >
        <ChartsSparklineChart
          :data="trendData"
          :color="sparklineColor"
          :height="KPI_CHART_DIMENSIONS.HEIGHT"
          :width="KPI_CHART_DIMENSIONS.WIDTH"
          :area="false"
        />
        <!-- TODO: Add comparison line overlay -->
      </div>

      <!-- Bar chart -->
      <ChartsBarChart
        v-else-if="chartType === 'bar'"
        :items="barChartItems"
        height="64px"
        :color="sparklineColor"
      />

      <!-- Default: Line chart -->
      <ChartsSparklineChart
        v-else
        :data="trendData"
        :color="sparklineColor"
        :height="KPI_CHART_DIMENSIONS.HEIGHT"
        :width="KPI_CHART_DIMENSIONS.WIDTH"
        :area="true"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { KpiChartType } from "../../types/dashboard";
import type { BarChartItem } from "../charts/bar-chart.vue";
import {
  KPI_BADGE_COLOR,
  KPI_ICON,
  KPI_COLORS,
  KPI_TEXT_COLOR,
  KPI_LABELS,
  KPI_PROGRESS,
  KPI_CHART_DIMENSIONS,
  type KpiBadgeColor,
  type KpiIcon,
  type KpiTextColor,
} from "../../constants/kpi";

const props = withDefaults(
  defineProps<{
    title: string;
    value: number | string;
    delta?: number;
    icon?: string;
    loading?: boolean;
    trendData?: number[];
    chartType?: KpiChartType;
    subMetric?: string;
    subMetricValue?: string | number;
    compareData?: number[];
  }>(),
  {
    delta: undefined,
    icon: undefined,
    loading: false,
    trendData: undefined,
    chartType: "line",
    subMetric: undefined,
    subMetricValue: undefined,
    compareData: undefined,
  }
);

const emit = defineEmits<{
  (e: "drilldown"): void;
}>();

const clickable = computed(() => !props.loading);

const deltaColor = computed((): KpiBadgeColor => {
  if (props.delta === undefined) return KPI_BADGE_COLOR.NEUTRAL;
  if (props.delta > 0) return KPI_BADGE_COLOR.SUCCESS;
  if (props.delta < 0) return KPI_BADGE_COLOR.ERROR;
  return KPI_BADGE_COLOR.NEUTRAL;
});

const deltaIcon = computed((): KpiIcon => {
  if (props.delta === undefined) return KPI_ICON.MINUS;
  if (props.delta > 0) return KPI_ICON.TRENDING_UP;
  if (props.delta < 0) return KPI_ICON.TRENDING_DOWN;
  return KPI_ICON.MINUS;
});

const formattedDelta = computed(() => {
  if (props.delta === undefined) return "";
  const sign = props.delta > 0 ? "+" : "";
  return `${sign}${props.delta}`;
});

const handleClick = () => {
  if (!clickable.value) return;
  emit("drilldown");
};

const sparklineColor = computed(() => {
  if (props.delta === undefined) return KPI_COLORS.EMERALD_500;
  if (props.delta > 0) return KPI_COLORS.EMERALD_500;
  if (props.delta < 0) return KPI_COLORS.ROSE_500;
  return KPI_COLORS.EMERALD_500;
});

const deltaColorClass = computed((): KpiTextColor => {
  if (props.delta === undefined) return KPI_TEXT_COLOR.MUTED;
  if (props.delta > 0) return KPI_TEXT_COLOR.EMERALD_600;
  if (props.delta < 0) return KPI_TEXT_COLOR.ROSE_600;
  return KPI_TEXT_COLOR.AMBER_600;
});

const subMetricColorClass = computed((): KpiTextColor => {
  if (props.delta === undefined) return KPI_TEXT_COLOR.EMERALD_600;
  if (props.delta > 0) return KPI_TEXT_COLOR.EMERALD_600;
  if (props.delta < 0) return KPI_TEXT_COLOR.ROSE_600;
  return KPI_TEXT_COLOR.AMBER_600;
});

const progressColor = computed((): KpiBadgeColor => {
  if (props.delta === undefined) return KPI_BADGE_COLOR.SUCCESS;
  if (props.delta > 0) return KPI_BADGE_COLOR.SUCCESS;
  if (props.delta < 0) return KPI_BADGE_COLOR.ERROR;
  return KPI_BADGE_COLOR.WARNING;
});

const progressValue = computed(() => {
  // For progress chart, use the main value as percentage
  if (typeof props.value === "string") {
    const num = parseFloat(props.value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(num) ? num : 0;
  }
  // If value is already a number, assume it's a percentage
  return typeof props.value === "number" ? props.value : 0;
});

const barChartItems = computed<BarChartItem[]>(() => {
  if (!props.trendData || props.trendData.length === 0) return [];
  return props.trendData.map((value, idx) => ({
    label: `${KPI_LABELS.DAY_PREFIX} ${idx + 1}`,
    value,
  }));
});
</script>
