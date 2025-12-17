<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-default">
          <slot name="title">{{ t('dashboard.activity.title') }}</slot>
        </h2>
        <p class="text-sm text-muted">
          <slot name="subtitle">{{ t('dashboard.activity.subtitle') }}</slot>
        </p>
      </div>
      <slot name="actions" />
    </div>

    <UCard>
      <div class="space-y-3">
        <div v-if="groups.length === 0" class="py-6 text-center">
          <p class="text-sm text-muted">{{ t('dashboard.activity.empty') }}</p>
        </div>

        <div v-else class="space-y-5">
          <div v-for="group in groups" :key="group.key" class="space-y-3">
            <p class="text-xs font-semibold text-muted uppercase tracking-wide">
              {{ group.label }}
            </p>

            <div class="space-y-3">
              <div v-for="item in group.items" :key="item.id" class="flex items-start gap-3">
                <div class="mt-0.5 flex size-8 items-center justify-center rounded-full bg-muted">
                  <UIcon :name="item.icon || 'i-lucide-activity'" class="size-4 text-muted" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-sm font-medium text-default truncate">{{ item.title }}</p>
                    <p class="text-xs text-dimmed whitespace-nowrap">{{ item.at }}</p>
                  </div>
                  <p v-if="item.description" class="mt-1 text-sm text-muted">
                    {{ item.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { RecentActivityEvent, RecentActivityType } from '@dashboard/types/dashboard'

const { t } = useI18n()

const props = defineProps<{
  events: RecentActivityEvent[]
}>()

type UiItem = {
  id: string
  title: string
  description?: string
  at: string
  icon?: string
  occurredAt: string
}

const iconForType = (type: RecentActivityType) => {
  switch (type) {
    case 'cv_uploaded':
      return 'i-lucide-upload'
    case 'job_saved':
      return 'i-lucide-save'
    case 'matching_completed':
      return 'i-lucide-sparkles'
    case 'interview_scheduled':
      return 'i-lucide-calendar-check'
    default:
      return 'i-lucide-activity'
  }
}

const titleForEvent = (e: RecentActivityEvent) => {
  const meta = e.meta ?? {}
  const candidateName = typeof meta.candidateName === 'string' ? meta.candidateName : undefined
  const jobTitle = typeof meta.jobTitle === 'string' ? meta.jobTitle : undefined
  const candidates = Number.isFinite(Number(meta.candidates)) ? Number(meta.candidates) : undefined

  switch (e.type) {
    case 'cv_uploaded':
      return candidateName
        ? t('dashboard.activity.types.cv-uploaded-with-name', { name: candidateName })
        : t('dashboard.activity.types.cv-uploaded')
    case 'job_saved':
      return jobTitle
        ? t('dashboard.activity.types.job-saved-with-title', { title: jobTitle })
        : t('dashboard.activity.types.job-saved')
    case 'matching_completed':
      return jobTitle
        ? t('dashboard.activity.types.matching-completed-with-title', { title: jobTitle })
        : t('dashboard.activity.types.matching-completed')
    case 'interview_scheduled':
      return candidateName && jobTitle
        ? t('dashboard.activity.types.interview-scheduled-with-name-title', { name: candidateName, title: jobTitle })
        : t('dashboard.activity.types.interview-scheduled')
    default:
      return t('dashboard.activity.types.unknown')
  }
}

const descriptionForEvent = (e: RecentActivityEvent) => {
  if (e.type !== 'matching_completed') return undefined
  const meta = e.meta ?? {}
  const candidates = Number.isFinite(Number(meta.candidates)) ? Number(meta.candidates) : undefined
  if (candidates === undefined) return undefined
  return t('dashboard.activity.types.matching-completed-desc', { count: candidates })
}

const formatTime = (iso: string) => {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return ''
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

const dayKey = (iso: string) => {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return 'other'
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
  const ts = d.getTime()
  if (ts >= startOfToday) return 'today'
  if (ts >= startOfYesterday) return 'yesterday'
  return 'other'
}

const uiItems = computed<UiItem[]>(() =>
  (props.events ?? [])
    .slice(0, 20)
    .map((e) => ({
      id: e.id,
      title: titleForEvent(e),
      description: descriptionForEvent(e),
      at: formatTime(e.occurredAt),
      icon: iconForType(e.type),
      occurredAt: e.occurredAt,
    }))
    .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt))
)

const groups = computed(() => {
  const by: Record<string, UiItem[]> = { today: [], yesterday: [], other: [] }
  for (const it of uiItems.value) {
    by[dayKey(it.occurredAt)]?.push(it)
  }

  const out: { key: string; label: string; items: UiItem[] }[] = []
  if (by.today.length) out.push({ key: 'today', label: t('dashboard.activity.group.today'), items: by.today })
  if (by.yesterday.length) out.push({ key: 'yesterday', label: t('dashboard.activity.group.yesterday'), items: by.yesterday })
  if (by.other.length) out.push({ key: 'other', label: t('dashboard.activity.group.earlier'), items: by.other })
  return out
})
</script>


