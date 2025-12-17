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
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div
          v-for="stage in stages"
          :key="stage.id"
          class="rounded-lg border border-default p-3"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-medium text-muted truncate">
              {{ stage.label }}
            </p>
            <UBadge :color="stage.color || 'neutral'" variant="subtle" size="xs">
              {{ stage.count }}
            </UBadge>
          </div>
          <div class="mt-2 text-xl font-semibold text-default tabular-nums">
            {{ stage.count }}
          </div>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { PipelineStage } from '@dashboard/types/dashboard'

const { t } = useI18n()

defineProps<{
  stages: PipelineStage[]
}>()
</script>


