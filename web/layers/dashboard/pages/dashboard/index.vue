<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-default">{{ t('dashboard.title') }}</h1>
        <p class="mt-1 text-sm text-muted">{{ t('dashboard.subtitle') }}</p>
      </div>

      <div class="flex items-center gap-2">
        <UBadge color="neutral" variant="subtle">
          {{ t(`dashboard.role.${role}`) }}
        </UBadge>
      </div>
    </div>

    <SectionsKpiSummaryCards :cards="kpis">
      <template #actions>
        <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-refresh-cw">
          {{ t('common.refresh') }}
        </UButton>
      </template>
    </SectionsKpiSummaryCards>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <!-- Active jobs -->
      <div class="xl:col-span-8">
        <SectionsActiveJobsTable :jobs="activeJobsData">
          <template #card-actions>
            <UButton
              to="/jobs"
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-briefcase"
            >
              {{ t('dashboard.active-jobs.view-all') }}
            </UButton>
          </template>
        </SectionsActiveJobsTable>
      </div>

      <!-- Tasks & alerts -->
      <div class="xl:col-span-4">
        <SectionsTasksAndAlertsPanel :items="alertsData">
          <template #actions>
            <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-list-todo">
              {{ t('dashboard.tasks.view-all') }}
            </UButton>
          </template>
        </SectionsTasksAndAlertsPanel>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionsMatchingHealthWidget
        v-if="canSeeMatchingHealth"
        :score-distribution="matchingScoreDistribution"
        :high-quality-ratio="highQualityRatio"
        :low-quality-ratio="lowQualityRatio"
      />

      <SectionsCandidatePipelineSnapshot
        v-if="canSeePipeline"
        :stages="candidatePipelineStages"
      />
    </div>

    <!-- Charts Section -->
    <div v-if="canSeePipeline" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Pipeline Stages Bar Chart -->
      <UCard>
        <template #header>
          <div class="space-y-1">
            <h3 class="text-base font-semibold text-default">
              {{ t('dashboard.pipeline.title') }} - {{ t('dashboard.pipeline.chart.bar-title') }}
            </h3>
            <p class="text-sm text-muted">
              {{ t('dashboard.pipeline.chart.bar-subtitle') }}
            </p>
          </div>
        </template>
        <ChartsBarChart
          :items="pipelineBarChartItems"
          height="280px"
        />
      </UCard>

      <!-- Pipeline Distribution Pie Chart -->
      <UCard>
        <template #header>
          <div class="space-y-1">
            <h3 class="text-base font-semibold text-default">
              {{ t('dashboard.pipeline.title') }} - {{ t('dashboard.pipeline.chart.pie-title') }}
            </h3>
            <p class="text-sm text-muted">
              {{ t('dashboard.pipeline.chart.pie-subtitle') }}
            </p>
          </div>
        </template>
        <ChartsPieChart
          :items="pipelinePieChartItems"
          height="280px"
          :show-legend="true"
          legend-position="bottom"
        />
      </UCard>
    </div>

    <SectionsRecentActivityTimeline :events="recentActivityEvents">
      <template #actions>
        <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-activity">
          {{ t('dashboard.activity.view-all') }}
        </UButton>
      </template>
    </SectionsRecentActivityTimeline>
  </div>
</template>

<script setup lang="ts">
import { DASHBOARD_ROLE } from '@dashboard/constants/roles'
import { useDashboardKpis } from '@dashboard/composables/use-dashboard-kpis'
import { useDashboardFilters } from '@dashboard/composables/use-dashboard-filters'
import { useActiveJobs } from '@dashboard/composables/use-active-jobs'
import { useDashboardAlerts } from '@dashboard/composables/use-dashboard-alerts'
import { useMatchingHealth } from '@dashboard/composables/use-matching-health'
import { useCandidatePipeline } from '@dashboard/composables/use-candidate-pipeline'
import { useRecentActivities } from '@dashboard/composables/use-recent-activities'
import type {
  KpiCard,
} from '@dashboard/types/dashboard'

definePageMeta({
  layout: 'dashboard',
  middleware: '01-auth',
})

const { t } = useI18n()

// Layer 3: Query params for filters
const { role } = useDashboardFilters()

// Layer 2: Shared composables for dashboard data
const {
  normalized,
  loading: kpisLoading,
  fetchKpis,
} = useDashboardKpis()

const {
  jobs: activeJobsData,
  fetchActiveJobs,
} = useActiveJobs()

const {
  alerts: alertsData,
  fetchAlerts,
} = useDashboardAlerts()

const {
  scoreDistribution: matchingScoreDistribution,
  highQualityRatio,
  lowQualityRatio,
  fetchMatchingHealth,
} = useMatchingHealth()

const {
  stages: candidatePipelineStages,
  fetchCandidatePipeline,
} = useCandidatePipeline()

const {
  events: recentActivityEvents,
  fetchRecentActivities,
} = useRecentActivities()

// Load all dashboard data on mount
onMounted(async () => {
  try {
    await Promise.all([
      fetchKpis(),
      fetchActiveJobs(),
      fetchAlerts(),
      fetchMatchingHealth(),
      fetchCandidatePipeline(),
      fetchRecentActivities(),
    ])
  } catch (err) {
    console.error('Failed to load dashboard data:', err)
  }
})

const canSeeMatchingHealth = computed(() => role.value === DASHBOARD_ROLE.RECRUITER)
const canSeePipeline = computed(() => role.value === DASHBOARD_ROLE.RECRUITER)

// Pipeline charts data
const pipelineBarChartItems = computed(() => {
  return candidatePipelineStages.map((stage) => ({
    label: t(`dashboard.pipeline.stages.${stage.id}`),
    value: stage.count,
  }))
})

const pipelinePieChartItems = computed(() => {
  const total = candidatePipelineStages.reduce((sum, s) => sum + s.count, 0)
  if (total === 0) return []
  
  return candidatePipelineStages
    .filter((stage) => stage.count > 0)
    .map((stage) => ({
      name: t(`dashboard.pipeline.stages.${stage.id}`),
      value: stage.count,
    }))
})

const kpis = computed<KpiCard[]>(() => {
  const baseValue = normalized.value

  // Mock trend data (last 7 days) - in real app, this would come from API
  const generateTrend = (current: number, variance: number = 0.2) => {
    const days = 7
    return Array.from({ length: days }, (_, i) => {
      const progress = i / (days - 1)
      const trend = current * (0.7 + progress * 0.3) // Simulate growth
      const random = (Math.random() - 0.5) * variance
      return Math.max(0, Math.round(trend * (1 + random)))
    })
  }

  return [
    {
      id: 'open-jobs',
      label: t('dashboard.kpi.open-jobs'),
      value: baseValue.openJobs,
      icon: 'i-lucide-briefcase',
      loading: kpisLoading.value,
      delta: 2,
      trendData: generateTrend(baseValue.openJobs),
      // Line chart: Trend số lượng job theo thời gian
      chartType: 'line',
    },
    {
      id: 'candidates-in-pipeline',
      label: t('dashboard.kpi.new-candidates'),
      value: baseValue.candidatesInPipeline,
      icon: 'i-lucide-users',
      loading: kpisLoading.value,
      delta: 5,
      trendData: generateTrend(baseValue.candidatesInPipeline),
      // Line chart: Trend số lượng ứng viên mới theo thời gian (continuous trend)
      chartType: 'line',
    },
    {
      id: 'matches-this-week',
      label: t('dashboard.kpi.avg-match'),
      value: `${baseValue.averageMatchScore}%`,
      icon: 'i-lucide-sparkles',
      loading: kpisLoading.value,
      delta: 3,
      trendData: generateTrend(baseValue.averageMatchScore, 0.15),
      // Line chart: Trend của percentage score theo thời gian
      chartType: 'line',
    },
    {
      id: 'time-to-shortlist',
      label: t('dashboard.kpi.time-to-hire'),
      value: `${baseValue.timeToShortlist}d`,
      icon: 'i-lucide-timer',
      loading: kpisLoading.value,
      delta: -1, // Negative is good (faster hiring)
      trendData: generateTrend(baseValue.timeToShortlist, 0.1).reverse(), // Reversed: lower is better
      // Line chart: Trend thời gian tuyển (muốn giảm theo thời gian)
      chartType: 'line',
    },
  ]
})

// All dashboard data is now managed via shared composables (Layer 2)
// Filters are managed via query params (Layer 3)
</script>


