<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-md font-semibold">{{ t('candidate.create.projects.title', { defaultValue: 'Projects' }) }}</h4>
      <UButton
        color="primary"
        variant="outline"
        size="sm"
        icon="i-lucide-plus"
        @click="handleAdd"
      >
        {{ t('candidate.create.projects.add', { defaultValue: 'Add Project' }) }}
      </UButton>
    </div>

    <div v-if="projects.length === 0" class="text-sm text-muted text-center py-4">
      {{ t('candidate.create.projects.empty', { defaultValue: 'No projects added. Click "Add Project" to add one.' }) }}
    </div>

    <div
      v-for="(project, index) in projects"
      :key="project.id || index"
      class="bg-muted rounded-lg p-2 space-y-4"
    >
      <UCollapsible class="flex flex-col gap-2 w-full">
        <UButton
          class="group w-full p-0"
          :label="`${project.name}`"
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
                project.name ||
                t("candidate.create.projects.entry", { defaultValue: "Project" })
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
              <UFormField :label="t('candidate.create.projects.name', { defaultValue: 'Project Name' })" name="name" required class="w-full">
                <UInput
                  v-model="project.name"
                  :placeholder="t('candidate.create.projects.name-placeholder', { defaultValue: 'Project name' })"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('candidate.create.projects.company', { defaultValue: 'Company' })" name="company" class="w-full">
                <UInput
                  v-model="project.company"
                  :placeholder="t('candidate.create.projects.company-placeholder', { defaultValue: 'Company name' })"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField :label="t('candidate.create.projects.position', { defaultValue: 'Position' })" name="position" class="w-full">
                <UInput
                  v-model="project.position"
                  :placeholder="t('candidate.create.projects.position-placeholder', { defaultValue: 'Lead Developer' })"
                  class="w-full"
                />
              </UFormField>

              <UFormField :label="t('candidate.create.projects.role', { defaultValue: 'Role' })" name="role" class="w-full">
                <UInput
                  v-model="project.role"
                  :placeholder="t('candidate.create.projects.role-placeholder', { defaultValue: 'Architect' })"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <UFormField :label="t('candidate.create.projects.start-date', { defaultValue: 'Start Date' })" name="startDate" class="w-full">
                <UInputDate
                  :ref="(el) => setDateInputRef(el, index, 'startDate')"
                  v-model="project.startDate"
                  class="w-full"
                >
                  <template #trailing>
                    <UPopover :reference="getDateInputRef(index, 'startDate')?.inputsRef?.[3]?.$el">
                      <UButton
                        color="neutral"
                        variant="link"
                        size="sm"
                        icon="i-lucide-calendar"
                        aria-label="Select a date"
                        class="px-0"
                      />
                      <template #content>
                        <UCalendar v-model="project.startDate" class="p-2" />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </UFormField>

              <UFormField :label="t('candidate.create.projects.end-date', { defaultValue: 'End Date' })" name="endDate" class="w-full">
                <UInputDate
                  :ref="(el) => setDateInputRef(el, index, 'endDate')"
                  v-model="project.endDate"
                  class="w-full"
                  :disabled="project.isCurrent"
                >
                  <template #trailing>
                    <UPopover :reference="getDateInputRef(index, 'endDate')?.inputsRef?.[3]?.$el">
                      <UButton
                        color="neutral"
                        variant="link"
                        size="sm"
                        icon="i-lucide-calendar"
                        aria-label="Select a date"
                        class="px-0"
                      />
                      <template #content>
                        <UCalendar v-model="project.endDate" class="p-2" />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </UFormField>

              <UFormField :label="t('candidate.create.projects.current', { defaultValue: 'Current Project' })" name="isCurrent" class="w-full">
                <UCheckbox
                  v-model="project.isCurrent"
                  :label="t('candidate.create.projects.current-label', { defaultValue: 'Ongoing project' })"
                />
              </UFormField>
            </div>

            <UFormField :label="t('candidate.create.projects.url', { defaultValue: 'Project URL' })" name="projectUrl" class="w-full">
              <UInput
                v-model="project.projectUrl"
                type="url"
                :placeholder="t('candidate.create.projects.url-placeholder', { defaultValue: 'https://github.com/user/project' })"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="t('candidate.create.projects.description', { defaultValue: 'Description' })" name="description" class="w-full">
              <UTextarea
                v-model="project.description"
                :rows="3"
                :placeholder="t('candidate.create.projects.description-placeholder', { defaultValue: 'Project description...' })"
                class="w-full"
              />
            </UFormField>

            <UFormField :label="t('candidate.create.projects.technologies', { defaultValue: 'Technologies Used' })" name="technologiesUsed" class="w-full">
              <UInput
                v-model="technologiesText[index]"
                :placeholder="t('candidate.create.projects.technologies-placeholder', { defaultValue: 'Comma-separated: React, Node.js, TypeScript' })"
                class="w-full"
                @update:model-value="handleTechnologiesChange(index, $event)"
              />
            </UFormField>

            <UFormField :label="t('candidate.create.projects.achievements', { defaultValue: 'Achievements' })" name="achievements" class="w-full">
              <div class="space-y-2">
                <div v-for="(achievement, aIndex) in project.achievements" :key="aIndex" class="flex gap-2">
                  <UInput
                    v-model="project.achievements[aIndex]"
                    :placeholder="t('candidate.create.projects.achievement-placeholder', { defaultValue: 'Achievement description' })"
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
                  {{ t('candidate.create.projects.add-achievement', { defaultValue: 'Add Achievement' }) }}
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
import type { ProjectEntry } from '@candidate/types/candidate'
import { CalendarDate, parseDate } from '@internationalized/date'
import { reactive } from 'vue'

const { t } = useI18n()

interface Props {
  modelValue: ProjectEntry[]
}

interface Emits {
  (e: 'update:modelValue', value: ProjectEntry[]): void
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
type ProjectWithCalendarDate = Omit<
  ProjectEntry,
  'startDate' | 'endDate'
> & {
  startDate?: CalendarDate
  endDate?: CalendarDate
}

const projects = reactive<ProjectWithCalendarDate[]>([])
let isSyncingFromProps = false

// Sync with props and convert dates
watch(
  () => props.modelValue,
  (newValue) => {
    isSyncingFromProps = true
    projects.splice(0, projects.length, ...newValue.map((proj) => ({
      ...proj,
      startDate: toCalendarDateValue(proj.startDate),
      endDate: toCalendarDateValue(proj.endDate),
    })))
    nextTick(() => {
      isSyncingFromProps = false
    })
  },
  { immediate: true, deep: true }
)

// Watch for changes and emit converted values (only when not syncing from props)
watch(
  () => projects,
  (newValue) => {
    if (isSyncingFromProps) return

    const converted = newValue.map((proj) => {
      let startDate: Date | string | CalendarDate | undefined = proj.startDate
      let endDate: Date | string | CalendarDate | undefined = proj.endDate

      if (startDate instanceof CalendarDate) {
        startDate = fromCalendarDateValue(startDate)
      } else if (startDate instanceof Date) {
        startDate = startDate.toISOString().split('T')[0]
      }

      if (endDate instanceof CalendarDate) {
        endDate = fromCalendarDateValue(endDate)
      } else if (endDate instanceof Date) {
        endDate = endDate.toISOString().split('T')[0]
      }

      return {
        ...proj,
        startDate,
        endDate,
      }
    })
    emit('update:modelValue', converted as ProjectEntry[])
  },
  { deep: true }
)

const technologiesText = reactive<string[]>([])

watch(
  () => projects,
  (newValue) => {
    technologiesText.splice(0, technologiesText.length, ...newValue.map(
      (proj) => proj.technologiesUsed?.join(', ') || ''
    ))
  },
  { immediate: true, deep: true }
)

const handleAdd = () => {
  projects.push({
    name: '',
    company: undefined,
    startDate: undefined,
    endDate: undefined,
    isCurrent: false,
    position: undefined,
    role: undefined,
    description: undefined,
    achievements: [],
    technologiesUsed: [],
    projectUrl: undefined,
    orderIndex: projects.length,
  })
  technologiesText.push('')
}

const handleRemove = (index: number) => {
  projects.splice(index, 1)
  technologiesText.splice(index, 1)
  // Update orderIndex
  projects.forEach((proj, idx) => {
    proj.orderIndex = idx
  })
}

const handleTechnologiesChange = (index: number, value: string) => {
  projects[index].technologiesUsed = value
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

const dateInputRefs = reactive<Record<string, any>>({})

const setDateInputRef = (el: any, index: number, field: 'startDate' | 'endDate') => {
  if (el) {
    dateInputRefs[`${index}-${field}`] = el
  }
}

const getDateInputRef = (index: number, field: 'startDate' | 'endDate') => {
  return dateInputRefs[`${index}-${field}`]
}

const addAchievement = (index: number) => {
  if (!projects[index].achievements) {
    projects[index].achievements = []
  }
  projects[index].achievements!.push('')
}

const removeAchievement = (projIndex: number, achIndex: number) => {
  projects[projIndex].achievements?.splice(achIndex, 1)
}

</script>

