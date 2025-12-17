<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-default">
          <slot name="title">{{ t('dashboard.tasks.title') }}</slot>
        </h2>
        <p class="text-sm text-muted">
          <slot name="subtitle">{{ t('dashboard.tasks.subtitle') }}</slot>
        </p>
      </div>
      <slot name="actions" />
    </div>

    <UCard>
      <div class="space-y-3">
        <div v-if="items.length === 0" class="py-6 text-center">
          <p class="text-sm text-muted">{{ t('dashboard.tasks.empty') }}</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="item in items"
            :key="item.id"
            class="flex items-start justify-between gap-3 rounded-lg border border-default p-3"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <UBadge :color="getSeverityColor(item.severity)" variant="subtle" size="sm">
                  {{ t(`dashboard.tasks.severity.${item.severity}`) }}
                </UBadge>
                <p class="text-sm font-medium text-default truncate">
                  {{ item.title }}
                </p>
              </div>
              <p v-if="item.description" class="mt-1 text-sm text-muted">
                {{ item.description }}
              </p>
              <p v-if="item.due" class="mt-2 text-xs text-dimmed">
                {{ t('dashboard.tasks.due', { due: item.due }) }}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <slot name="item-actions" :item="item">
                <UButton
                  v-if="item.ctaLabel"
                  color="neutral"
                  variant="outline"
                  size="sm"
                >
                  {{ item.ctaLabel }}
                </UButton>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { TaskItem, TaskSeverity } from '@dashboard/types/dashboard'

const { t } = useI18n()

defineProps<{
  items: TaskItem[]
}>()

const getSeverityColor = (severity: TaskSeverity) => {
  const map = {
    info: 'info',
    warning: 'warning',
    error: 'error',
    success: 'success',
  } as const
  return map[severity]
}
</script>


