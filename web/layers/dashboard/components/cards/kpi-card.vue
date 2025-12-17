<template>
  <UCard
    class="h-full"
    :ui="{
      body: 'p-4',
      header: 'p-4 pb-0',
    }"
  >
    <template #header>
      <button
        type="button"
        class="group flex w-full items-start justify-between gap-3 text-left"
        :class="clickable ? 'cursor-pointer' : 'cursor-default'"
        :disabled="!clickable"
        @click="handleClick"
      >
        <div class="min-w-0">
          <p class="text-xs font-medium text-muted">
            {{ title }}
          </p>
        </div>

        <UIcon v-if="icon" :name="icon" class="size-4 text-muted" />
      </button>
    </template>

    <div class="mt-3 space-y-2">
      <USkeleton v-if="loading" class="h-7 w-24" />
      <div v-else class="text-2xl font-semibold text-default tabular-nums">
        {{ value }}
      </div>

      <div v-if="delta !== undefined" class="flex items-center gap-2">
        <UBadge :color="deltaColor" variant="subtle" size="sm">
          <UIcon :name="deltaIcon" class="size-3" />
          <span class="ml-1 tabular-nums">{{ formattedDelta }}</span>
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string
    value: number | string
    delta?: number
    icon?: string
    loading?: boolean
  }>(),
  {
    delta: undefined,
    icon: undefined,
    loading: false,
  }
)

const emit = defineEmits<{
  (e: 'drilldown'): void
}>()

const clickable = computed(() => !props.loading)

const deltaColor = computed(() => {
  if (props.delta === undefined) return 'neutral'
  if (props.delta > 0) return 'success'
  if (props.delta < 0) return 'error'
  return 'neutral'
})

const deltaIcon = computed(() => {
  if (props.delta === undefined) return 'i-lucide-minus'
  if (props.delta > 0) return 'i-lucide-trending-up'
  if (props.delta < 0) return 'i-lucide-trending-down'
  return 'i-lucide-minus'
})

const formattedDelta = computed(() => {
  if (props.delta === undefined) return ''
  const sign = props.delta > 0 ? '+' : ''
  return `${sign}${props.delta}`
})

const handleClick = () => {
  if (!clickable.value) return
  emit('drilldown')
}
</script>


