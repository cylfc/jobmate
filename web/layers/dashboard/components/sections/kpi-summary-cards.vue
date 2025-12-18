<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-default">
          <slot name="title">{{ t('dashboard.kpi.title') }}</slot>
        </h2>
        <p class="text-sm text-muted">
          <slot name="subtitle">{{ t('dashboard.kpi.subtitle') }}</slot>
        </p>
      </div>
      <slot name="actions" />
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
      <CardsKpiCard
        v-for="card in cards"
        :key="card.id"
        :title="card.label"
        :value="card.value"
        :delta="card.delta"
        :icon="card.icon"
        :loading="card.loading"
        :trend-data="card.trendData"
        @drilldown="$emit('drilldown', card.id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { KpiCard } from '@dashboard/types/dashboard'

const { t } = useI18n()

defineEmits<{
  (e: 'drilldown', kpiId: string): void
}>()

defineProps<{
  cards: KpiCard[]
}>()
</script>


