<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex items-center justify-center p-8">
      <UIcon name="i-lucide-loader" class="w-6 h-6 animate-spin text-primary" />
    </div>

    <div v-else-if="items.length === 0" class="text-center p-8 text-muted">
      <p>{{ $t("chat.components.source-table.no-data") }}</p>
    </div>

    <div v-else class="space-y-2 max-h-96 overflow-y-auto">
      <div
        v-for="item in items"
        :key="getItemId(item)"
        class="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-elevated transition-colors cursor-pointer"
        :class="{ 'ring-2 ring-primary': isSelected(item) }"
        @click="toggleItem(item)"
      >
        <div class="flex-1">
          <p class="font-medium">{{ getItemTitle(item) }}</p>
          <p class="text-sm text-muted">{{ getItemSubtitle(item) }}</p>
        </div>
        <UCheckbox
          :model-value="isSelected(item)"
          @update:model-value="toggleItem(item)"
          @click.stop
        />
      </div>
    </div>

    <UButton
      v-if="selectedItems.length > 0"
      color="primary"
      block
      @click="handleConfirm"
    >
      {{
        $t("chat.components.source-table.confirm", {
          count: selectedItems.length,
        })
      }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useMatchingJob } from "@matching/composables/use-matching-job";
import { useMatchingCandidate } from "@matching/composables/use-matching-candidate";
import type { Job } from "@job/types/job";
import type { Candidate } from "@candidate/types/candidate";

interface Props {
  type: "job" | "candidate";
}

type SourceTableItem =
  | Job
  | Candidate
  | { id?: string; value?: string; [key: string]: unknown };

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "update", data: { items: SourceTableItem[] }): void;
}>();

const jobOps = useMatchingJob();
const candidateOps = useMatchingCandidate();

const loading = ref(true);
const items = ref<SourceTableItem[]>([]);
const selectedItems = ref<SourceTableItem[]>([]);

const isSelected = (item: SourceTableItem) => {
  return selectedItems.value.some(
    (selected) => getItemId(selected) === getItemId(item),
  );
};

const getItemId = (item: SourceTableItem) => {
  if ("id" in item && item.id) return String(item.id);
  if ("value" in item && item.value) return String(item.value);
  return JSON.stringify(item);
};

const { t } = useI18n();

const getItemTitle = (item: SourceTableItem) => {
  if (props.type === "job") {
    if ("title" in item && item.title) return String(item.title);
    if ("label" in item && item.label) return String(item.label);
    return t("chat.components.source-table.untitled-job");
  }
  if ("firstName" in item || "lastName" in item) {
    const firstName = "firstName" in item ? String(item.firstName || "") : "";
    const lastName = "lastName" in item ? String(item.lastName || "") : "";
    const name = `${firstName} ${lastName}`.trim();
    if (name) return name;
  }
  if ("name" in item && item.name) return String(item.name);
  if ("label" in item && item.label) return String(item.label);
  return t("chat.components.source-table.unknown");
};

const getItemSubtitle = (item: SourceTableItem) => {
  if (props.type === "job") {
    if ("company" in item && item.company) return String(item.company);
    if ("description" in item && typeof item.description === "string") {
      return item.description.substring(0, 50);
    }
    return "";
  }
  if ("email" in item && item.email) return String(item.email);
  if ("description" in item && typeof item.description === "string") {
    return item.description.substring(0, 50);
  }
  return "";
};

const toggleItem = (item: SourceTableItem) => {
  const index = selectedItems.value.findIndex(
    (selected) => getItemId(selected) === getItemId(item),
  );
  if (index >= 0) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(item);
  }
};

const handleConfirm = () => {
  emit("update", { items: selectedItems.value });
};

onMounted(async () => {
  loading.value = true;
  try {
    if (props.type === "job") {
      items.value = await jobOps.getJobsFromDatabase();
    } else {
      items.value = await candidateOps.getCandidatesFromDatabase();
    }
  } catch (error) {
    console.error("Error loading items:", error);
  } finally {
    loading.value = false;
  }
});
</script>
