<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-md font-semibold">
        {{ t("candidate.create.work-experience.title") }}
      </h4>
      <UButton
        color="primary"
        variant="outline"
        size="sm"
        icon="i-lucide-plus"
        @click="handleAdd"
      >
        {{ t("candidate.create.work-experience.add") }}
      </UButton>
    </div>

    <div
      v-if="workExperiences.length === 0"
      class="text-sm text-muted text-center py-4"
    >
      {{ t("candidate.create.work-experience.empty") }}
    </div>

    <div
      v-for="(exp, index) in workExperiences"
      :key="exp.id || index"
      class="bg-muted rounded-lg p-2 space-y-4"
    >
      <UCollapsible class="flex flex-col gap-2 w-full">
        <UButton
          class="group w-full p-0"
          :label="`${exp.companyName}`"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-chevron-down"
          :ui="{
            trailingIcon:
              'group-data-[state=open]:rotate-180 transition-transform duration-200',
          }"
          block
        >
          <div class="flex items-center justify-between flex-1 w-full">
            <span class="text-sm font-medium">
              {{
                exp.companyName || t("candidate.create.work-experience.entry")
              }}
              #{{ index + 1 }}
            </span>
            <UButton
              color="error"
              variant="ghost"
              size="sm"
              icon="i-lucide-trash"
              @click="handleRemove(index)"
            />
          </div>
        </UButton>

        <template #content>
          <div class="w-full">
            <div class="grid grid-cols-2 gap-4">
              <UFormField
                :label="t('candidate.create.work-experience.company')"
                name="companyName"
                required
                class="w-full"
              >
                <UInput
                  v-model="exp.companyName"
                  :placeholder="
                    t('candidate.create.work-experience.company-placeholder')
                  "
                  class="w-full"
                />
              </UFormField>

              <UFormField
                :label="t('candidate.create.work-experience.position')"
                name="position"
                required
                class="w-full"
              >
                <UInput
                  v-model="exp.position"
                  :placeholder="
                    t('candidate.create.work-experience.position-placeholder')
                  "
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField
                :label="t('candidate.create.work-experience.role')"
                name="role"
                class="w-full"
              >
                <UInput
                  v-model="exp.role"
                  :placeholder="
                    t('candidate.create.work-experience.role-placeholder')
                  "
                  class="w-full"
                />
              </UFormField>

              <UFormField
                :label="t('candidate.create.work-experience.employment-type')"
                name="employmentType"
                class="w-full"
              >
                <USelectMenu
                  v-model="exp.employmentType"
                  :items="employmentTypeOptions"
                  value-key="value"
                  :placeholder="
                    t(
                      'candidate.create.work-experience.employment-type-placeholder'
                    )
                  "
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <UFormField
                :label="t('candidate.create.work-experience.start-date')"
                name="startDate"
                required
                class="w-full"
              >
                <UInputDate
                  :ref="(el) => setDateInputRef(el, index, 'startDate')"
                  v-model="exp.startDate"
                  class="w-full"
                >
                  <template #trailing>
                    <UPopover
                      :reference="
                        getDateInputRef(index, 'startDate')?.inputsRef?.[3]?.$el
                      "
                    >
                      <UButton
                        color="neutral"
                        variant="link"
                        size="sm"
                        icon="i-lucide-calendar"
                        aria-label="Select a date"
                        class="px-0"
                      />
                      <template #content>
                        <UCalendar v-model="exp.startDate" class="p-2" />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </UFormField>

              <UFormField
                :label="t('candidate.create.work-experience.end-date')"
                name="endDate"
                class="w-full"
              >
                <UInputDate
                  :ref="(el) => setDateInputRef(el, index, 'endDate')"
                  v-model="exp.endDate"
                  class="w-full"
                  :disabled="exp.isCurrent"
                >
                  <template #trailing>
                    <UPopover
                      :reference="
                        getDateInputRef(index, 'endDate')?.inputsRef?.[3]?.$el
                      "
                    >
                      <UButton
                        color="neutral"
                        variant="link"
                        size="sm"
                        icon="i-lucide-calendar"
                        aria-label="Select a date"
                        class="px-0"
                      />
                      <template #content>
                        <UCalendar v-model="exp.endDate" class="p-2" />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </UFormField>

              <UFormField
                :label="t('candidate.create.work-experience.current')"
                name="isCurrent"
                class="w-full"
              >
                <UCheckbox
                  v-model="exp.isCurrent"
                  :label="t('candidate.create.work-experience.current-label')"
                />
              </UFormField>
            </div>

            <UFormField
              :label="t('candidate.create.work-experience.location')"
              name="location"
              class="w-full"
            >
              <UInput
                v-model="exp.location"
                :placeholder="
                  t('candidate.create.work-experience.location-placeholder')
                "
                class="w-full"
              />
            </UFormField>

            <UFormField
              :label="t('candidate.create.work-experience.description')"
              name="description"
              class="w-full"
            >
              <UTextarea
                v-model="exp.description"
                :rows="3"
                :placeholder="
                  t('candidate.create.work-experience.description-placeholder')
                "
                class="w-full"
              />
            </UFormField>

            <UFormField
              :label="t('candidate.create.work-experience.technologies')"
              name="technologiesUsed"
              class="w-full"
            >
              <UInput
                v-model="technologiesText[index]"
                :placeholder="
                  t('candidate.create.work-experience.technologies-placeholder')
                "
                class="w-full"
                @update:model-value="handleTechnologiesChange(index, $event)"
              />
            </UFormField>

            <UFormField
              :label="t('candidate.create.work-experience.achievements')"
              name="achievements"
              class="w-full"
            >
              <div class="space-y-2">
                <div
                  v-for="(achievement, aIndex) in exp.achievements"
                  :key="aIndex"
                  class="flex gap-2"
                >
                  <UInput
                    v-model="exp.achievements[aIndex]"
                    :placeholder="
                      t(
                        'candidate.create.work-experience.achievement-placeholder'
                      )
                    "
                    class="w-full"
                  />
                  <UButton
                    color="error"
                    variant="ghost"
                    size="sm"
                    icon="i-lucide-x"
                    @click="removeAchievement(index, aIndex)"
                  />
                </div>
                <UButton
                  color="primary"
                  variant="outline"
                  size="sm"
                  icon="i-lucide-plus"
                  @click="addAchievement(index)"
                >
                  {{ t("candidate.create.work-experience.add-achievement") }}
                </UButton>
              </div>
            </UFormField>
          </div>
        </template>
      </UCollapsible>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorkExperienceEntry } from "@candidate/types/candidate";
import { CalendarDate, parseDate } from "@internationalized/date";
import { reactive } from 'vue';

const { t } = useI18n();

interface Props {
  modelValue: WorkExperienceEntry[];
}

interface Emits {
  (e: "update:modelValue", value: WorkExperienceEntry[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Helper function to convert date to CalendarDate
const toCalendarDateValue = (
  value: Date | string | CalendarDate | undefined
): CalendarDate | undefined => {
  if (!value) return undefined;
  if (value instanceof CalendarDate) return value;
  if (typeof value === "string") {
    try {
      // Try parsing as YYYY-MM-DD format first
      return parseDate(value);
    } catch {
      // If parseDate fails, try parsing as ISO string and convert
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return new CalendarDate(
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate()
        );
      }
      return undefined;
    }
  }
  if (value instanceof Date) {
    return new CalendarDate(
      value.getFullYear(),
      value.getMonth() + 1,
      value.getDate()
    );
  }
  return undefined;
};

// Helper function to convert CalendarDate back to string (for API)
const fromCalendarDateValue = (
  value: CalendarDate | undefined
): string | undefined => {
  if (!value) return undefined;
  if (value instanceof CalendarDate) {
    return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
  }
  return undefined;
};

// Local reactive array with CalendarDate conversions
type WorkExperienceWithCalendarDate = Omit<
  WorkExperienceEntry,
  "startDate" | "endDate"
> & {
  startDate?: CalendarDate;
  endDate?: CalendarDate;
};

const workExperiences = reactive<WorkExperienceWithCalendarDate[]>([]);
let isSyncingFromProps = false;

// Sync with props and convert dates
watch(
  () => props.modelValue,
  (newValue) => {
    isSyncingFromProps = true;
    workExperiences.splice(0, workExperiences.length, ...newValue.map((exp) => ({
      ...exp,
      startDate: toCalendarDateValue(exp.startDate),
      endDate: toCalendarDateValue(exp.endDate),
    })));
    nextTick(() => {
      isSyncingFromProps = false;
    });
  },
  { immediate: true, deep: true }
);

// Watch for changes and emit converted values (only when not syncing from props)
watch(
  () => workExperiences,
  (newValue) => {
    if (isSyncingFromProps) return;

    const converted = newValue.map((exp) => {
      let startDate: Date | string | CalendarDate | undefined = exp.startDate;
      let endDate: Date | string | CalendarDate | undefined = exp.endDate;

      if (startDate instanceof CalendarDate) {
        startDate = fromCalendarDateValue(startDate);
      } else if (startDate instanceof Date) {
        startDate = startDate.toISOString().split("T")[0];
      }

      if (endDate instanceof CalendarDate) {
        endDate = fromCalendarDateValue(endDate);
      } else if (endDate instanceof Date) {
        endDate = endDate.toISOString().split("T")[0];
      }

      return {
        ...exp,
        startDate,
        endDate,
      };
    });
    emit("update:modelValue", converted as WorkExperienceEntry[]);
  },
  { deep: true }
);

const technologiesText = reactive<string[]>([]);

watch(
  () => workExperiences,
  (newValue) => {
    technologiesText.splice(0, technologiesText.length, ...newValue.map(
      (exp) => exp.technologiesUsed?.join(", ") || ""
    ));
  },
  { immediate: true, deep: true }
);

// Fetch form options from API
const { formOptions } = useCandidateFormOptions()
const employmentTypeOptions = computed(() => formOptions.value.employmentTypes)

const handleAdd = () => {
  const today = new Date();
  workExperiences.push({
    companyName: "",
    position: "",
    role: undefined,
    startDate: new CalendarDate(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    ),
    endDate: undefined,
    isCurrent: false,
    employmentType: undefined,
    location: undefined,
    description: undefined,
    achievements: [],
    technologiesUsed: [],
    orderIndex: workExperiences.length,
  });
  technologiesText.push("");
};

const handleRemove = (index: number) => {
  workExperiences.splice(index, 1);
  technologiesText.splice(index, 1);
  // Update orderIndex
  workExperiences.forEach((exp, idx) => {
    exp.orderIndex = idx;
  });
};

const handleTechnologiesChange = (index: number, value: string) => {
  const exp = workExperiences[index];
  if (!exp) return;
  exp.technologiesUsed = value
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
};

const dateInputRefs = reactive<Record<string, any>>({});

const setDateInputRef = (
  el: any,
  index: number,
  field: "startDate" | "endDate"
) => {
  if (el) {
    dateInputRefs[`${index}-${field}`] = el;
  }
};

const getDateInputRef = (index: number, field: "startDate" | "endDate") => {
  return dateInputRefs[`${index}-${field}`];
};

const addAchievement = (index: number) => {
  const exp = workExperiences[index];
  if (!exp) return;
  if (!exp.achievements) {
    exp.achievements = [];
  }
  exp.achievements.push("");
};

const removeAchievement = (expIndex: number, achIndex: number) => {
  const exp = workExperiences[expIndex];
  if (!exp || !exp.achievements) return;
  exp.achievements.splice(achIndex, 1);
};
</script>
