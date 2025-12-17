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
        <div v-if="items.length === 0" class="py-6 text-center">
          <p class="text-sm text-muted">{{ t('dashboard.activity.empty') }}</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="item in items" :key="item.id" class="flex items-start gap-3">
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
    </UCard>
  </section>
</template>

<script setup lang="ts">
import type { ActivityItem } from '@dashboard/types/dashboard'

const { t } = useI18n()

defineProps<{
  items: ActivityItem[]
}>()
</script>


