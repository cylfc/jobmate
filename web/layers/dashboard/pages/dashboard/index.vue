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
        <SectionsTasksAlertsPanel :items="tasks">
          <template #actions>
            <UButton color="neutral" variant="outline" size="sm" icon="i-lucide-list-todo">
              {{ t('dashboard.tasks.view-all') }}
            </UButton>
          </template>
        </SectionsTasksAlertsPanel>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionsMatchingHealthAnalytics
        v-if="canSeeMatchingHealth"
        :metrics="matchingHealth"
      />

      <SectionsCandidatePipelineSnapshot
        v-if="canSeePipeline"
        :stages="pipelineStages"
      />
    </div>

    <SectionsRecentActivityTimeline :items="recentActivity">
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
import type {
  ActivityItem,
  ActiveJobRow,
  KpiCard,
  MatchingHealthMetric,
  PipelineStage,
  TaskItem,
} from '@dashboard/types/dashboard'

definePageMeta({
  layout: 'dashboard',
})

const { t } = useI18n()
const { role } = useDashboardRole()
const { normalized: kpiValues, pending: isKpiLoading } = useDashboardKpis()

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

const activeJobs = ref<ActiveJobRow[]>([
  {
    id: 'job-1',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    location: 'Ho Chi Minh City',
    status: 'published',
    applicants: 32,
    matched: 11,
    updatedAt: '2h',
  },
  {
    id: 'job-2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Hanoi',
    status: 'published',
    applicants: 18,
    matched: 6,
    updatedAt: '1d',
  },
  {
    id: 'job-3',
    title: 'Backend Developer',
    company: 'Data Solutions',
    location: 'Da Nang',
    status: 'draft',
    applicants: 0,
    matched: 0,
    updatedAt: '3d',
  },
])

const tasks = ref<TaskItem[]>([
  {
    id: 'task-1',
    title: t('dashboard.tasks.items.review-shortlist'),
    description: t('dashboard.tasks.items.review-shortlist-desc', { count: 5 }),
    severity: 'warning',
    due: 'Today',
    ctaLabel: t('dashboard.tasks.cta.review'),
  },
  {
    id: 'task-2',
    title: t('dashboard.tasks.items.follow-up'),
    description: t('dashboard.tasks.items.follow-up-desc', { count: 3 }),
    severity: 'info',
    due: 'Tomorrow',
    ctaLabel: t('dashboard.tasks.cta.send'),
  },
  {
    id: 'task-3',
    title: t('dashboard.tasks.items.stale-jobs'),
    description: t('dashboard.tasks.items.stale-jobs-desc', { count: 2 }),
    severity: 'error',
    ctaLabel: t('dashboard.tasks.cta.fix'),
  },
])

const matchingHealth = ref<MatchingHealthMetric[]>([
  {
    id: 'mh-1',
    label: t('dashboard.matching-health.metrics.coverage'),
    value: 84,
    hint: t('dashboard.matching-health.hints.coverage'),
  },
  {
    id: 'mh-2',
    label: t('dashboard.matching-health.metrics.extraction'),
    value: 91,
    hint: t('dashboard.matching-health.hints.extraction'),
  },
  {
    id: 'mh-3',
    label: t('dashboard.matching-health.metrics.response-time'),
    value: 67,
    hint: t('dashboard.matching-health.hints.response-time'),
  },
  {
    id: 'mh-4',
    label: t('dashboard.matching-health.metrics.feedback'),
    value: 58,
    hint: t('dashboard.matching-health.hints.feedback'),
  },
])

const pipelineStages = ref<PipelineStage[]>([
  { id: 'p-1', label: t('dashboard.pipeline.stages.applied'), count: 24, color: 'info' },
  { id: 'p-2', label: t('dashboard.pipeline.stages.screening'), count: 12, color: 'warning' },
  { id: 'p-3', label: t('dashboard.pipeline.stages.interview'), count: 6, color: 'primary' },
  { id: 'p-4', label: t('dashboard.pipeline.stages.offer'), count: 2, color: 'success' },
  { id: 'p-5', label: t('dashboard.pipeline.stages.hired'), count: 1, color: 'success' },
  { id: 'p-6', label: t('dashboard.pipeline.stages.rejected'), count: 5, color: 'neutral' },
])

const recentActivity = ref<ActivityItem[]>([
  {
    id: 'a-1',
    title: t('dashboard.activity.items.matching-complete'),
    description: t('dashboard.activity.items.matching-complete-desc', { count: 5 }),
    at: '5m',
    icon: 'i-lucide-sparkles',
  },
  {
    id: 'a-2',
    title: t('dashboard.activity.items.candidate-added'),
    description: t('dashboard.activity.items.candidate-added-desc', { name: 'Nguyễn Văn A' }),
    at: '1h',
    icon: 'i-lucide-user-plus',
  },
  {
    id: 'a-3',
    title: t('dashboard.activity.items.job-published'),
    description: t('dashboard.activity.items.job-published-desc', { title: 'Senior Frontend Developer' }),
    at: '1d',
    icon: 'i-lucide-briefcase',
  },
])
</script>


