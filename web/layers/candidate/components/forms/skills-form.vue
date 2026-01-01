<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-md font-semibold">{{ t('candidate.create.skills.title', { defaultValue: 'Skills' }) }}</h4>
      <UButton
        color="primary"
        variant="outline"
        size="sm"
        icon="i-lucide-plus"
        @click="handleAdd"
      >
        {{ t('candidate.create.skills.add', { defaultValue: 'Add Skill' }) }}
      </UButton>
    </div>

    <div v-if="skills.length === 0" class="text-sm text-muted text-center py-4">
      {{ t('candidate.create.skills.empty', { defaultValue: 'No skills added. Click "Add Skill" to add one.' }) }}
    </div>

    <div
      v-for="(skill, index) in skills"
      :key="skill.id || index"
      class="bg-muted rounded-lg p-2 space-y-4"
    >
      <UCollapsible class="flex flex-col gap-2 w-full">
        <UButton
          class="group w-full p-0"
          :label="`${skill.name}`"
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
                skill.name ||
                t("candidate.create.skills.entry", { defaultValue: "Skill" })
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
              <UFormField :label="t('candidate.create.skills.name', { defaultValue: 'Skill Name' })" name="name" required class="w-full">
                <UInput
                  v-model="skill.name"
                  :placeholder="t('candidate.create.skills.name-placeholder', { defaultValue: 'JavaScript' })"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('candidate.create.skills.type', { defaultValue: 'Skill Type' })" name="skillType" class="w-full">
                <USelectMenu
                  v-model="skill.skillType"
                  :items="skillTypeOptions"
                  value-key="value"
                  :placeholder="t('candidate.create.skills.type-placeholder', { defaultValue: 'Select type' })"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div v-if="skill.skillType === 'language'" class="grid grid-cols-2 gap-4">
              <UFormField :label="t('candidate.create.skills.level', { defaultValue: 'Level' })" name="level" class="w-full">
                <USelectMenu
                  v-model="skill.level"
                  :items="levelOptions"
                  value-key="value"
                  :placeholder="t('candidate.create.skills.level-placeholder', { defaultValue: 'Select level' })"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('candidate.create.skills.proficiency', { defaultValue: 'Proficiency (%)' })" name="proficiencyPercentage" class="w-full">
                <UInput
                  v-model.number="skill.proficiencyPercentage"
                  type="number"
                  min="0"
                  max="100"
                  :placeholder="t('candidate.create.skills.proficiency-placeholder', { defaultValue: '85' })"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div v-else class="grid grid-cols-2 gap-4">
              <UFormField :label="t('candidate.create.skills.years', { defaultValue: 'Years of Experience' })" name="yearsOfExperience" class="w-full">
                <UInput
                  v-model.number="skill.yearsOfExperience"
                  type="number"
                  step="0.5"
                  min="0"
                  :placeholder="t('candidate.create.skills.years-placeholder', { defaultValue: '5' })"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('candidate.create.skills.last-used', { defaultValue: 'Last Used' })" name="lastUsedDate" class="w-full">
                <UInputDate
                  :ref="(el) => setDateInputRef(el, index)"
                  v-model="skill.lastUsedDate"
                  class="w-full"
                >
                  <template #trailing>
                    <UPopover :reference="getDateInputRef(index)?.inputsRef?.[3]?.$el">
                      <UButton
                        color="neutral"
                        variant="link"
                        size="sm"
                        icon="i-lucide-calendar"
                        aria-label="Select a date"
                        class="px-0"
                      />
                      <template #content>
                        <UCalendar v-model="skill.lastUsedDate" class="p-2" />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </UFormField>
            </div>

            <UFormField :label="t('candidate.create.skills.description', { defaultValue: 'Description' })" name="description" class="w-full">
              <UTextarea
                v-model="skill.description"
                :rows="2"
                :placeholder="t('candidate.create.skills.description-placeholder', { defaultValue: 'Additional details...' })"
                class="w-full"
              />
            </UFormField>
          </div>
        </template>
      </UCollapsible>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SkillEntry } from '@candidate/types/candidate'
import { CalendarDate, parseDate } from '@internationalized/date'

const { t } = useI18n()

interface Props {
  modelValue: SkillEntry[]
}

interface Emits {
  (e: 'update:modelValue', value: SkillEntry[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Helper function to convert date to CalendarDate
const toCalendarDateValue = (
  value: Date | string | CalendarDate | undefined
): CalendarDate | undefined => {
  if (!value) return undefined
  if (value instanceof CalendarDate) return value
  if (typeof value === 'string') {
    try {
      // Try parsing as YYYY-MM-DD format first
      return parseDate(value)
    } catch {
      // If parseDate fails, try parsing as ISO string and convert
      const date = new Date(value)
      if (!isNaN(date.getTime())) {
        return new CalendarDate(
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate()
        )
      }
      return undefined
    }
  }
  if (value instanceof Date) {
    return new CalendarDate(
      value.getFullYear(),
      value.getMonth() + 1,
      value.getDate()
    )
  }
  return undefined
}

// Helper function to convert CalendarDate back to string (for API)
const fromCalendarDateValue = (
  value: CalendarDate | undefined
): string | undefined => {
  if (!value) return undefined
  if (value instanceof CalendarDate) {
    return `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`
  }
  return undefined
}

// Local reactive array with CalendarDate conversions
type SkillWithCalendarDate = Omit<
  SkillEntry,
  'lastUsedDate'
> & {
  lastUsedDate?: CalendarDate
}

const skills = ref<SkillWithCalendarDate[]>([])
let isSyncingFromProps = false

// Sync with props and convert dates
watch(
  () => props.modelValue,
  (newValue) => {
    isSyncingFromProps = true
    skills.value = newValue.map((skill) => ({
      ...skill,
      lastUsedDate: toCalendarDateValue(skill.lastUsedDate),
    }))
    nextTick(() => {
      isSyncingFromProps = false
    })
  },
  { immediate: true, deep: true }
)

// Watch for changes and emit converted values (only when not syncing from props)
watch(
  skills,
  (newValue) => {
    if (isSyncingFromProps) return

    const converted = newValue.map((skill) => {
      let lastUsedDate: Date | string | CalendarDate | undefined = skill.lastUsedDate

      if (lastUsedDate instanceof CalendarDate) {
        lastUsedDate = fromCalendarDateValue(lastUsedDate)
      } else if (lastUsedDate instanceof Date) {
        lastUsedDate = lastUsedDate.toISOString().split('T')[0]
      }

      return {
        ...skill,
        lastUsedDate,
      }
    })
    emit('update:modelValue', converted as SkillEntry[])
  },
  { deep: true }
)

// Fetch form options from API
const { formOptions } = useCandidateFormOptions()
const skillTypeOptions = computed(() => formOptions.value.skillTypes)
const levelOptions = computed(() => formOptions.value.skillLevels)

const handleAdd = () => {
  skills.value.push({
    name: '',
    skillType: 'technical',
    level: undefined,
    yearsOfExperience: undefined,
    proficiencyPercentage: undefined,
    lastUsedDate: undefined,
    description: undefined,
    orderIndex: skills.value.length,
  })
}

const handleRemove = (index: number) => {
  skills.value.splice(index, 1)
  // Update orderIndex
  skills.value.forEach((skill, idx) => {
    skill.orderIndex = idx
  })
}

const dateInputRefs = ref<Record<string, any>>({})

const setDateInputRef = (el: any, index: number) => {
  if (el) {
    dateInputRefs.value[`${index}-lastUsedDate`] = el
  }
}

const getDateInputRef = (index: number) => {
  return dateInputRefs.value[`${index}-lastUsedDate`]
}


</script>

