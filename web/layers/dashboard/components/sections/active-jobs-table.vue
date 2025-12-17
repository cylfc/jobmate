<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-default">
          <slot name="title">{{ t('dashboard.active-jobs.title') }}</slot>
        </h2>
        <p class="text-sm text-muted">
          <slot name="subtitle">{{ t('dashboard.active-jobs.subtitle') }}</slot>
        </p>
      </div>
      <slot name="actions" />
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm text-muted">
            {{ t('dashboard.active-jobs.count', { count: jobs.length }) }}
          </div>
          <slot name="card-actions" />
        </div>
      </template>

      <div class="overflow-x-auto">
        <UTable
          :data="jobs"
          :columns="columns"
          class="w-full active-jobs-table"
          @select="handleRowSelect"
        />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { ActiveJobRow, JobStatus } from '@dashboard/types/dashboard'
import { hasRunMatching, needsAttention } from '@dashboard/composables/use-active-jobs'

const { t } = useI18n()
const UBadge = resolveComponent('UBadge')
const router = useRouter()

defineProps<{
  jobs: ActiveJobRow[]
}>()

const getStatusColor = (status: JobStatus) => {
  const map = {
    published: 'success',
    draft: 'neutral',
    closed: 'warning',
  } as const
  return map[status]
}

const formatScore = (score: number | null) => {
  if (score === null) return '—'
  const safe = Math.max(0, Math.min(100, Math.round(score)))
  return `${safe}%`
}

const formatLastActivity = (iso: string) => {
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) return t('common.unknown')
  const diffSec = Math.floor((Date.now() - ms) / 1000)
  if (diffSec < 60) return t('notification.just-now')
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return t('notification.minutes-ago', { count: diffMin })
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return t('notification.hours-ago', { count: diffHr })
  const diffDay = Math.floor(diffHr / 24)
  return t('notification.days-ago', { count: diffDay })
}

const columns: TableColumn<ActiveJobRow>[] = [
  {
    accessorKey: 'title',
    header: t('dashboard.active-jobs.columns.title'),
    cell: ({ row }) => {
      const job = row.original
      const titleClass = needsAttention(job)
        ? 'font-medium text-default'
        : 'font-medium text-default'

      return h('div', { class: 'flex items-start justify-between gap-2' }, [
        h('div', { class: 'min-w-0' }, [
          h('div', { class: `truncate ${titleClass}` }, job.title),
          needsAttention(job)
            ? h(
                'div',
                { class: 'mt-1 text-xs text-warning flex items-center gap-1' },
                [
                  h('span', { class: 'size-1.5 rounded-full bg-warning inline-block' }),
                  h('span', {}, 'Matching not run'),
                ]
              )
            : null,
        ]),
        hasRunMatching(job)
          ? null
          : h(UBadge, { color: 'warning', variant: 'subtle', size: 'sm' }, () => 'Needs matching'),
      ])
    },
  },
  {
    accessorKey: 'status',
    header: t('dashboard.active-jobs.columns.status'),
    cell: ({ row }) =>
      h(UBadge, { color: getStatusColor(row.original.status), variant: 'subtle', class: 'capitalize' }, () =>
        t(`dashboard.active-jobs.status.${row.original.status}`)
      ),
  },
  {
    accessorKey: 'candidatesCount',
    header: t('dashboard.active-jobs.columns.candidates'),
    cell: ({ row }) =>
      h('div', { class: 'text-sm text-default tabular-nums text-right' }, String(row.original.candidatesCount)),
  },
  {
    accessorKey: 'topMatchScore',
    header: t('dashboard.active-jobs.columns.top-match'),
    cell: ({ row }) =>
      h(
        'div',
        {
          class: hasRunMatching(row.original)
            ? 'text-sm text-default tabular-nums text-right'
            : 'text-sm text-dimmed tabular-nums text-right',
        },
        formatScore(row.original.topMatchScore)
      ),
  },
  {
    accessorKey: 'lastActivityAt',
    header: t('dashboard.active-jobs.columns.last-activity'),
    cell: ({ row }) => h('div', { class: 'text-sm text-muted tabular-nums' }, formatLastActivity(row.original.lastActivityAt)),
  },
]

const handleRowSelect = (row: ActiveJobRow) => {
  router.push({
    path: '/matching',
    query: {
      prefill: 'job',
      jobId: row.id,
    },
  })
}
</script>

<style scoped>
.active-jobs-table :deep(tbody tr) {
  cursor: pointer;
}
</style>


