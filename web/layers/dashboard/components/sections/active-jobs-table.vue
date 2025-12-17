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
        <UTable :data="jobs" :columns="columns" class="w-full" />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { ActiveJobRow, JobStatus } from '@dashboard/types/dashboard'

const { t } = useI18n()
const UBadge = resolveComponent('UBadge')

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

const columns: TableColumn<ActiveJobRow>[] = [
  {
    accessorKey: 'title',
    header: t('dashboard.active-jobs.columns.title'),
    cell: ({ row }) => {
      const job = row.original
      return h('div', { class: 'flex flex-col' }, [
        h('div', { class: 'font-medium text-default' }, job.title),
        h('div', { class: 'text-xs text-muted' }, `${job.company}${job.location ? ` • ${job.location}` : ''}`),
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
    accessorKey: 'applicants',
    header: t('dashboard.active-jobs.columns.applicants'),
    cell: ({ row }) => h('div', { class: 'text-sm text-default tabular-nums' }, String(row.original.applicants)),
  },
  {
    accessorKey: 'matched',
    header: t('dashboard.active-jobs.columns.matched'),
    cell: ({ row }) => h('div', { class: 'text-sm text-default tabular-nums' }, String(row.original.matched)),
  },
  {
    accessorKey: 'updatedAt',
    header: t('dashboard.active-jobs.columns.updated-at'),
    cell: ({ row }) => h('div', { class: 'text-sm text-muted' }, row.original.updatedAt),
  },
]
</script>


