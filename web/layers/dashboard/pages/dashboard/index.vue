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
        <SectionsActiveJobsTable :jobs="activeJobs">
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
        <SectionsTasksAndAlertsPanel :items="alerts">
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
import { useDashboardRole } from '@dashboard/composables/use-dashboard-role'
import { useActiveJobs } from '@dashboard/composables/use-active-jobs'
import { useDashboardAlerts } from '@dashboard/composables/use-dashboard-alerts'
import { useMatchingHealth } from '@dashboard/composables/use-matching-health'
import { useCandidatePipeline } from '@dashboard/composables/use-candidate-pipeline'
import { useRecentActivities } from '@dashboard/composables/use-recent-activities'
import type {
  ActiveJobRow,
  KpiCard,
  PipelineStage,
} from '@dashboard/types/dashboard'

definePageMeta({
  layout: 'dashboard',
})

const { t } = useI18n()
const { role } = useDashboardRole()
const { normalized: kpiValues, pending: isKpiLoading } = useDashboardKpis()
const { jobs: activeJobs } = useActiveJobs()
const { alerts } = useDashboardAlerts()
const {
  scoreDistribution: matchingScoreDistribution,
  highQualityRatio,
  lowQualityRatio,
} = useMatchingHealth()
const { stages: candidatePipelineStages } = useCandidatePipeline()
const { events: recentActivityEvents } = useRecentActivities()

const canSeeMatchingHealth = computed(() => role.value === DASHBOARD_ROLE.RECRUITER)
const canSeePipeline = computed(() => role.value === DASHBOARD_ROLE.RECRUITER)

const kpis = computed<KpiCard[]>(() => [
  {
    id: 'open-jobs',
    label: t('dashboard.kpi.open-jobs'),
    value: kpiValues.value.openJobs,
    icon: 'i-lucide-briefcase',
    loading: isKpiLoading.value,
  },
  {
    id: 'candidates-in-pipeline',
    label: t('dashboard.kpi.new-candidates'),
    value: kpiValues.value.candidatesInPipeline,
    icon: 'i-lucide-users',
    loading: isKpiLoading.value,
  },
  {
    id: 'matches-this-week',
    label: t('dashboard.kpi.avg-match'),
    value: `${kpiValues.value.averageMatchScore}%`,
    icon: 'i-lucide-sparkles',
    loading: isKpiLoading.value,
  },
  {
    id: 'time-to-shortlist',
    label: t('dashboard.kpi.time-to-hire'),
    value: `${kpiValues.value.timeToShortlist}d`,
    icon: 'i-lucide-timer',
    loading: isKpiLoading.value,
  },
])

// Active jobs are now fetched via `useActiveJobs()`
// (kept as computed in the composable for consistent sorting/normalization)
void (activeJobs satisfies Readonly<Ref<ActiveJobRow[]>>)
// Tasks & alerts are now fetched via `useDashboardAlerts()`

// Matching health is now fetched via `useMatchingHealth()`.

// Candidate pipeline is now fetched via `useCandidatePipeline()`.

// Recent activity is now fetched via `useRecentActivities()`.
</script>


