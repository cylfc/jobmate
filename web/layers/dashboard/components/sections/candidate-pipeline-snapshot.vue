<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-default">
          <slot name="title">{{ t('dashboard.pipeline.title') }}</slot>
        </h2>
        <p class="text-sm text-muted">
          <slot name="subtitle">{{ t('dashboard.pipeline.subtitle') }}</slot>
        </p>
      </div>
      <slot name="actions" />
    </div>

    <UCard>
      <div class="space-y-4">
        <!-- Stacked horizontal funnel -->
        <!-- <UCard :ui="{ body: 'p-3' }">
          <div class="flex h-9 w-full overflow-hidden rounded-lg bg-muted">
            <button
              v-for="seg in segments"
              :key="seg.id"
              type="button"
              class="group relative h-full min-w-0 shrink-0 px-3 text-left transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              :class="seg.isBottleneck ? 'ring-1 ring-warning' : ''"
              :style="{ width: `${seg.widthPct}%` }"
              @click="handleStageClick(seg.id)"
            >
              <div
                class="pointer-events-none absolute inset-0 opacity-80"
                :class="seg.bgClass"
              />
              <div class="relative z-10 flex h-full items-center justify-between gap-2">
                <span class="truncate text-xs font-medium text-toned">
                  {{ seg.label }}
                </span>
                <span class="text-xs tabular-nums text-default">
                  {{ seg.count }}
                </span>
              </div>
            </button>
          </div>
        </UCard> -->

        <!-- Details row (quick diagnosis) -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <UCard
            v-for="s in stageCards"
            :key="s.id"
            :ui="{ body: 'p-3' }"
            class="h-full transition hover:bg-muted/40"
          >
            <button
              type="button"
              class="w-full text-left focus-visible:outline-none"
              @click="handleStageClick(s.id)"
            >
              <div class="flex items-start justify-between gap-2">
                <p class="text-xs font-medium text-muted truncate">
                  {{ s.label }}
                </p>
                <UBadge
                  v-if="s.isBottleneck"
                  color="warning"
                  variant="subtle"
                  size="xs"
                >
                  {{ t('dashboard.pipeline.bottleneck') }}
                </UBadge>
              </div>
              <div class="mt-2 flex items-baseline justify-between gap-2">
                <div class="text-xl font-semibold text-default tabular-nums">
                  {{ s.count }}
                </div>
                <div v-if="s.dropFromPrevPct !== null" class="text-xs tabular-nums text-muted">
                  -{{ s.dropFromPrevPct }}%
                </div>
              </div>
            </button>
          </UCard>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { CandidatePipelineStage, CandidatePipelineStageId } from '../../types/dashboard'

const { t } = useI18n()
const router = useRouter()

const props = defineProps<{
  stages: CandidatePipelineStage[]
}>()

const emit = defineEmits<{
  (e: 'stageClick', stageId: CandidatePipelineStageId): void
}>()

const stageLabel = (id: CandidatePipelineStageId) => {
  const key = `dashboard.pipeline.stages.${id}`
  const translated = t(key)
  // If key missing, i18n returns the key; fallback to raw id for future stages.
  return translated === key ? String(id) : translated
}

const clampPct = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0)

type Segment = {
  id: CandidatePipelineStageId
  label: string
  count: number
  widthPct: number
  isBottleneck: boolean
  bgClass: string
}

const maxCount = computed(() => Math.max(1, ...props.stages.map((s) => s.count)))

// Identify bottleneck as the stage with the largest relative drop from previous stage.
const bottleneckStageId = computed<CandidatePipelineStageId | null>(() => {
  const stages = props.stages
  if (stages.length < 2) return null

  let bestId: CandidatePipelineStageId | null = null
  let bestDrop = 0
  for (let i = 1; i < stages.length; i++) {
    const prev = stages[i - 1].count
    const cur = stages[i].count
    if (prev <= 0) continue
    const drop = (prev - cur) / prev
    if (drop > bestDrop) {
      bestDrop = drop
      bestId = stages[i].id
    }
  }
  return bestId
})

const bgByIndex = (idx: number) => {
  // Simple, high-contrast palette using Tailwind colors (avoid relying on custom tokens like bg-info).
  const classes = [
    'bg-primary/15',
    'bg-sky-500/15',
    'bg-emerald-500/15',
    'bg-amber-500/15',
    'bg-slate-500/15',
  ]
  return classes[idx % classes.length]
}

const segments = computed<Segment[]>(() =>
  props.stages.map((s, idx) => ({
    id: s.id,
    label: stageLabel(s.id),
    count: s.count,
    widthPct: clampPct((s.count / maxCount.value) * 100),
    isBottleneck: bottleneckStageId.value === s.id,
    bgClass: bgByIndex(idx),
  }))
)

const stageCards = computed(() => {
  const stages = props.stages
  const bottleneck = bottleneckStageId.value

  return stages.map((s, idx) => {
    let dropFromPrevPct: number | null = null
    if (idx > 0) {
      const prev = stages[idx - 1].count
      if (prev > 0) dropFromPrevPct = Math.round(((prev - s.count) / prev) * 100)
    }

    return {
      id: s.id,
      label: stageLabel(s.id),
      count: s.count,
      dropFromPrevPct,
      isBottleneck: bottleneck === s.id,
    }
  })
})

const handleStageClick = (stageId: CandidatePipelineStageId) => {
  emit('stageClick', stageId)
  // Default behavior: navigate to candidates with a query param.
  // Candidate list can later implement this query key without changing this widget.
  router.push({ path: '/candidates', query: { pipelineStage: stageId } })
}
</script>


