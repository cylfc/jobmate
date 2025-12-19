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
          <NuxtLink
            v-for="item in items"
            :key="item.id"
            :to="item.actionUrl"
            class="group block rounded-lg border border-default p-3 transition-colors hover:bg-muted"
            :class="item.severity === 'critical' ? 'ring-1 ring-error/30' : ''"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <UBadge :color="severityColor(item.severity)" variant="subtle" size="sm">
                    {{ item.severity }}
                  </UBadge>
                  <p class="text-sm font-medium text-default truncate">
                    {{ item.message }}
                  </p>
                </div>
                <p class="mt-1 text-xs text-dimmed truncate">
                  {{ item.type }}
                </p>
              </div>

              <div class="flex items-center gap-2 text-muted group-hover:text-default">
                <UIcon name="i-lucide-arrow-right" class="size-4" />
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { DashboardAlert, DashboardAlertSeverity } from '@dashboard/types/dashboard'

const { t } = useI18n()

defineProps<{
  items: DashboardAlert[]
}>()

const severityColor = (severity: DashboardAlertSeverity) => {
  const map = {
    info: 'info',
    warning: 'warning',
    critical: 'error',
  } as const
  return map[severity]
}
</script>



