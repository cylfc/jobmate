<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-default">
          <slot name="title">{{ t('dashboard.matching-health.title') }}</slot>
        </h2>
        <p class="text-sm text-muted">
          <slot name="subtitle">{{ t('dashboard.matching-health.subtitle') }}</slot>
        </p>
      </div>
      <slot name="actions" />
    </div>

    <UCard>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div v-for="metric in metrics" :key="metric.id" class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-medium text-toned">{{ metric.label }}</p>
            <p class="text-sm text-default tabular-nums">{{ metric.value }}%</p>
          </div>
          <UProgress :value="metric.value" :max="100" />
          <p v-if="metric.hint" class="text-xs text-muted">{{ metric.hint }}</p>
        </div>
      </div>

      <slot name="footer" />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { MatchingHealthMetric } from '@dashboard/types/dashboard'

const { t } = useI18n()

defineProps<{
  metrics: MatchingHealthMetric[]
}>()
</script>


