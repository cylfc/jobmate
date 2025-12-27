<template>
  <div class="flex flex-row justify-between items-end gap-4">
    <div class="flex-1 grid grid-cols-4 justify-start items-start gap-4">
      <UFormField :label="t('job.filter.search')" name="search">
        <UInput
          class="w-full"
          :model-value="localFilters.search"
          :placeholder="t('job.filter.search-placeholder')"
          icon="i-lucide-search"
          clearable
          @update:model-value="updateLocalFilter('search', $event)"
        />
      </UFormField>

      <UFormField :label="t('job.filter.status')" name="status">
        <USelectMenu
          class="w-full"
          :model-value="localFilters.status"
          :options="statusOptionsWithFallback"
          :placeholder="t('job.filter.status-placeholder')"
          clearable
          @update:model-value="handleStatusChange"
        />
      </UFormField>

      <UFormField :label="t('job.filter.company')" name="company">
        <UInput
          class="w-full"
          :model-value="localFilters.company"
          :placeholder="t('job.filter.company-placeholder')"
          clearable
          @update:model-value="updateLocalFilter('company', $event)"
        />
      </UFormField>

      <UFormField :label="t('job.filter.location')" name="location">
        <UInput
          class="w-full"
          :model-value="localFilters.location"
          :placeholder="t('job.filter.location-placeholder')"
          clearable
          @update:model-value="updateLocalFilter('location', $event)"
        />
      </UFormField>
    </div>

    <div class="flex items-center justify-end gap-2">
      <UButton
        v-if="hasActiveFilters"
        color="neutral"
        variant="ghost"
        size="md"
        @click="handleReset"
      >
        {{ t("job.filter.reset") }}
      </UButton>
      <UButton color="primary" variant="soft" size="md" @click="handleApply">
        {{ t("job.filter.apply") }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { JobFilter } from "@job/types/job";
import { useJobFilters } from "@job/composables/use-job-filters";
import { useJobFilterOptions } from "@job/composables/use-job-filter-options";

const { t } = useI18n();

type Emits = {
  (e: "apply"): void;
  (e: "reset"): void;
};

const emit = defineEmits<Emits>();

// Use query params composable
const {
  filters: queryFilters,
  updateFilters,
  resetFilters,
  hasActiveFilters,
} = useJobFilters();

// Use filter options composable
const {
  statusOptions,
  fetchOptions,
} = useJobFilterOptions();

// Load filter options on mount
onMounted(async () => {
  try {
    await fetchOptions();
  } catch (err) {
    console.error("Failed to load filter options:", err);
  }
});

// Local filter state for form inputs (synced with query params)
const localFilters = ref<JobFilter>({
  search: queryFilters.value.search,
  status: queryFilters.value.status,
  company: queryFilters.value.company,
  location: queryFilters.value.location,
});

// Sync local filters with query params when they change
watch(
  queryFilters,
  (newFilters) => {
    localFilters.value = {
      search: newFilters.search,
      status: newFilters.status,
      company: newFilters.company,
      location: newFilters.location,
    };
  },
  { immediate: true, deep: true }
);

// Use status options from API (with fallback)
const statusOptionsWithFallback = computed(() => {
  // Fallback to i18n if options not loaded yet
  if (statusOptions.value.length === 0) {
    return [
      { label: t("job.status.draft"), value: "draft" },
      { label: t("job.status.published"), value: "published" },
      { label: t("job.status.closed"), value: "closed" },
    ];
  }
  return statusOptions.value;
});

const updateLocalFilter = (
  key: keyof JobFilter,
  value: string | number | undefined
) => {
  localFilters.value = {
    ...localFilters.value,
    [key]: value as JobFilter[keyof JobFilter],
  };
};

const handleStatusChange = (value: unknown) => {
  // Handle USelectMenu value type
  const statusValue =
    typeof value === "string"
      ? value
      : typeof value === "number"
        ? String(value)
        : value === null || value === undefined
          ? undefined
          : String(value);
  updateLocalFilter("status", statusValue as JobFilter["status"]);
};

const handleApply = () => {
  // Update query params with local filters
  updateFilters(localFilters.value);
  emit("apply");
};

const handleReset = () => {
  // Reset query params
  resetFilters();
  // Reset local filters
  localFilters.value = {};
  emit("reset");
};
</script>
