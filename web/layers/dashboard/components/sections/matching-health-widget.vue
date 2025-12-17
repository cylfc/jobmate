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
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- High quality -->
        <UCard
          :ui="{ body: 'p-4' }"
          class="h-full"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-medium text-toned">
                {{ t('dashboard.matching-health.high-quality') }}
              </p>
              <p class="text-sm text-default tabular-nums">{{ percent(highQualityRatio) }}</p>
            </div>
            <UProgress :value="highQualityRatio * 100" :max="100" />
            <p class="text-xs text-muted">
              {{ t('dashboard.matching-health.high-quality-hint') }}
            </p>
          </div>
        </UCard>

        <!-- Low quality -->
        <UCard
          :ui="{ body: 'p-4' }"
          class="h-full"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <p class="text-sm font-medium text-toned">
                {{ t('dashboard.matching-health.low-quality') }}
              </p>
              <p class="text-sm text-default tabular-nums">{{ percent(lowQualityRatio) }}</p>
            </div>
            <UProgress :value="lowQualityRatio * 100" :max="100" />
            <p class="text-xs text-muted">
              {{ t('dashboard.matching-health.low-quality-hint') }}
            </p>
          </div>
        </UCard>

        <!-- Distribution -->
        <UCard
          :ui="{ body: 'p-4' }"
          class="h-full lg:col-span-2"
        >
          <div class="space-y-3">
            <div class="space-y-1">
              <p class="text-sm font-medium text-toned">{{ t('dashboard.matching-health.distribution') }}</p>
              <p class="text-xs text-muted">{{ t('dashboard.matching-health.distribution-hint') }}</p>
            </div>

            <ChartsScoreDistribution :bins="props.scoreDistribution" />
          </div>
        </UCard>
      </div>

      <slot name="footer" />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { MatchScoreDistributionBin } from '../../types/dashboard'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    scoreDistribution?: MatchScoreDistributionBin[]
    highQualityRatio?: number
    lowQualityRatio?: number
  }>(),
  {
    scoreDistribution: () => [],
    highQualityRatio: 0,
    lowQualityRatio: 0,
  }
)

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0)
const percent = (ratio: number) => `${Math.round(clamp01(ratio) * 100)}%`
</script>


