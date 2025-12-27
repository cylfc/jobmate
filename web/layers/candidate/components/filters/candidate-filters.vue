<template>
  <div class="flex flex-row justify-between items-end gap-4">
    <div class="flex-1 grid grid-cols-4 justify-start items-start gap-4">
      <UFormField :label="t('candidate.filter.search')" name="search">
        <UInput
          class="w-full"
          :model-value="localFilters.search"
          :placeholder="t('candidate.filter.search-placeholder')"
          icon="i-lucide-search"
          clearable
          @update:model-value="updateLocalFilter('search', $event)"
        />
      </UFormField>

      <UFormField :label="t('candidate.filter.status')" name="status">
        <USelectMenu
          class="w-full"
          :model-value="localFilters.status"
          :options="statusOptionsWithFallback"
          :placeholder="t('candidate.filter.status-placeholder')"
          clearable
          @update:model-value="handleStatusChange"
        />
      </UFormField>

      <UFormField
        :label="t('candidate.filter.min-experience')"
        name="minExperience"
      >
        <UInput
          class="w-full"
          :model-value="localFilters.minExperience"
          type="number"
          :min="experienceRange.min"
          :max="experienceRange.max"
          :step="experienceRange.step || 1"
          :placeholder="t('candidate.filter.min-experience-placeholder')"
          clearable
          @update:model-value="
            updateLocalFilter(
              'minExperience',
              $event ? Number($event) : undefined
            )
          "
        />
      </UFormField>

      <UFormField
        :label="t('candidate.filter.max-experience')"
        name="maxExperience"
      >
        <UInput
          class="w-full"
          :model-value="localFilters.maxExperience"
          type="number"
          :min="experienceRange.min"
          :max="experienceRange.max"
          :step="experienceRange.step || 1"
          :placeholder="t('candidate.filter.max-experience-placeholder')"
          clearable
          @update:model-value="
            updateLocalFilter(
              'maxExperience',
              $event ? Number($event) : undefined
            )
          "
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
        {{ t("candidate.filter.reset") }}
      </UButton>
      <UButton color="primary" variant="soft" size="md" @click="handleApply">
        {{ t("candidate.filter.apply") }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CandidateFilter } from "@candidate/types/candidate";
import { useCandidateFilters } from "@candidate/composables/use-candidate-filters";
import { useCandidateFilterOptions } from "@candidate/composables/use-candidate-filter-options";

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
} = useCandidateFilters();

// Use filter options composable
const {
  statusOptions,
  experienceRange,
  fetchOptions,
} = useCandidateFilterOptions();

// Load filter options on mount
onMounted(async () => {
  try {
    await fetchOptions();
  } catch (err) {
    console.error("Failed to load filter options:", err);
  }
});

// Local filter state for form inputs (synced with query params)
const localFilters = ref<CandidateFilter>({
  search: queryFilters.value.search,
  status: queryFilters.value.status,
  minExperience: queryFilters.value.minExperience,
  maxExperience: queryFilters.value.maxExperience,
});

// Sync local filters with query params when they change
watch(
  queryFilters,
  (newFilters) => {
    localFilters.value = {
      search: newFilters.search,
      status: newFilters.status,
      minExperience: newFilters.minExperience,
      maxExperience: newFilters.maxExperience,
    };
  },
  { immediate: true, deep: true }
);

// Use status options from API (with fallback)
const statusOptionsWithFallback = computed(() => {
  // Fallback to i18n if options not loaded yet
  if (statusOptions.value.length === 0) {
    return [
      { label: t("candidate.status.active"), value: "active" },
      { label: t("candidate.status.inactive"), value: "inactive" },
      { label: t("candidate.status.archived"), value: "archived" },
    ];
  }
  return statusOptions.value;
});

const updateLocalFilter = (
  key: keyof CandidateFilter,
  value: string | number | undefined
) => {
  localFilters.value = {
    ...localFilters.value,
    [key]: value as CandidateFilter[keyof CandidateFilter],
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
  updateLocalFilter("status", statusValue as CandidateFilter["status"]);
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
