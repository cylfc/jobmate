<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-md font-semibold">{{ t('candidate.create.work-experience.title', { defaultValue: 'Work Experience' }) }}</h4>
      <UButton
        color="primary"
        variant="outline"
        size="sm"
        icon="i-lucide-plus"
        @click="handleAdd"
      >
        {{ t('candidate.create.work-experience.add', { defaultValue: 'Add Experience' }) }}
      </UButton>
    </div>

    <div v-if="workExperiences.length === 0" class="text-sm text-muted text-center py-4">
      {{ t('candidate.create.work-experience.empty', { defaultValue: 'No work experience entries. Click "Add Experience" to add one.' }) }}
    </div>

    <div v-for="(exp, index) in workExperiences" :key="exp.id || index" class="border rounded-lg p-4 space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">
          {{ exp.companyName || t('candidate.create.work-experience.entry', { defaultValue: 'Experience' }) }} #{{ index + 1 }}
        </span>
        <UButton
          color="error"
          variant="ghost"
          size="sm"
          icon="i-lucide-trash"
          @click="handleRemove(index)"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UFormField :label="t('candidate.create.work-experience.company', { defaultValue: 'Company Name' })" name="companyName" required class="w-full">
          <UInput
            v-model="exp.companyName"
            :placeholder="t('candidate.create.work-experience.company-placeholder', { defaultValue: 'Company name' })"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('candidate.create.work-experience.position', { defaultValue: 'Position' })" name="position" required class="w-full">
          <UInput
            v-model="exp.position"
            :placeholder="t('candidate.create.work-experience.position-placeholder', { defaultValue: 'Software Engineer' })"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UFormField :label="t('candidate.create.work-experience.role', { defaultValue: 'Role' })" name="role" class="w-full">
          <UInput
            v-model="exp.role"
            :placeholder="t('candidate.create.work-experience.role-placeholder', { defaultValue: 'Team Lead' })"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="t('candidate.create.work-experience.employment-type', { defaultValue: 'Employment Type' })" name="employmentType" class="w-full">
          <USelectMenu
            v-model="exp.employmentType"
            :options="employmentTypeOptions"
            :placeholder="t('candidate.create.work-experience.employment-type-placeholder', { defaultValue: 'Select type' })"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <UFormField :label="t('candidate.create.work-experience.start-date', { defaultValue: 'Start Date' })" name="startDate" required class="w-full">
          <UInputDate
            :ref="(el) => setDateInputRef(el, index, 'startDate')"
            v-model="exp.startDate"
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
                  <UCalendar v-model="exp.startDate" class="p-2" />
                </template>
              </UPopover>
            </template>
          </UInputDate>
        </UFormField>

        <UFormField :label="t('candidate.create.work-experience.end-date', { defaultValue: 'End Date' })" name="endDate" class="w-full">
          <UInputDate
            :ref="(el) => setDateInputRef(el, index, 'endDate')"
            v-model="exp.endDate"
            class="w-full"
            :disabled="exp.isCurrent"
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
                  <UCalendar v-model="exp.endDate" class="p-2" />
                </template>
              </UPopover>
            </template>
          </UInputDate>
        </UFormField>

        <UFormField :label="t('candidate.create.work-experience.current', { defaultValue: 'Current Job' })" name="isCurrent" class="w-full">
          <UCheckbox
            v-model="exp.isCurrent"
            :label="t('candidate.create.work-experience.current-label', { defaultValue: 'I currently work here' })"
          />
        </UFormField>
      </div>

      <UFormField :label="t('candidate.create.work-experience.location', { defaultValue: 'Location' })" name="location" class="w-full">
        <UInput
          v-model="exp.location"
          :placeholder="t('candidate.create.work-experience.location-placeholder', { defaultValue: 'City, Country' })"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('candidate.create.work-experience.description', { defaultValue: 'Description' })" name="description" class="w-full">
        <UTextarea
          v-model="exp.description"
          :rows="3"
          :placeholder="t('candidate.create.work-experience.description-placeholder', { defaultValue: 'Job responsibilities and achievements...' })"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('candidate.create.work-experience.technologies', { defaultValue: 'Technologies Used' })" name="technologiesUsed" class="w-full">
        <UInput
          v-model="technologiesText[index]"
          :placeholder="t('candidate.create.work-experience.technologies-placeholder', { defaultValue: 'Comma-separated: React, Node.js, TypeScript' })"
          class="w-full"
          @update:model-value="handleTechnologiesChange(index, $event)"
        />
      </UFormField>

      <UFormField :label="t('candidate.create.work-experience.achievements', { defaultValue: 'Achievements' })" name="achievements" class="w-full">
        <div class="space-y-2">
          <div v-for="(achievement, aIndex) in exp.achievements" :key="aIndex" class="flex gap-2">
            <UInput
              v-model="exp.achievements[aIndex]"
              :placeholder="t('candidate.create.work-experience.achievement-placeholder', { defaultValue: 'Achievement description' })"
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
            {{ t('candidate.create.work-experience.add-achievement', { defaultValue: 'Add Achievement' }) }}
          </UButton>
        </div>
      </UFormField>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorkExperienceEntry } from '@candidate/types/candidate'

const { t } = useI18n()

interface Props {
  modelValue: WorkExperienceEntry[]
}

interface Emits {
  (e: 'update:modelValue', value: WorkExperienceEntry[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const workExperiences = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const technologiesText = ref<string[]>([])

watch(() => props.modelValue, (newValue) => {
  technologiesText.value = newValue.map((exp) => exp.technologiesUsed?.join(', ') || '')
}, { immediate: true, deep: true })

const employmentTypeOptions = [
  { label: 'Full Time', value: 'FULL_TIME' },
  { label: 'Part Time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Remote', value: 'REMOTE' },
]

const handleAdd = () => {
  workExperiences.value.push({
    companyName: '',
    position: '',
    role: undefined,
    startDate: new Date().toISOString().split('T')[0] as string,
    endDate: undefined,
    isCurrent: false,
    employmentType: undefined,
    location: undefined,
    description: undefined,
    achievements: [],
    technologiesUsed: [],
    orderIndex: workExperiences.value.length,
  })
  technologiesText.value.push('')
}

const handleRemove = (index: number) => {
  workExperiences.value.splice(index, 1)
  technologiesText.value.splice(index, 1)
  // Update orderIndex
  workExperiences.value.forEach((exp, idx) => {
    exp.orderIndex = idx
  })
}

const handleTechnologiesChange = (index: number, value: string) => {
  const exp = workExperiences.value[index]
  if (!exp) return
  exp.technologiesUsed = value
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
}

const dateInputRefs = ref<Record<string, any>>({})

const setDateInputRef = (el: any, index: number, field: 'startDate' | 'endDate') => {
  if (el) {
    dateInputRefs.value[`${index}-${field}`] = el
  }
}

const getDateInputRef = (index: number, field: 'startDate' | 'endDate') => {
  return dateInputRefs.value[`${index}-${field}`]
}

const addAchievement = (index: number) => {
  const exp = workExperiences.value[index]
  if (!exp) return
  if (!exp.achievements) {
    exp.achievements = []
  }
  exp.achievements.push('')
}

const removeAchievement = (expIndex: number, achIndex: number) => {
  const exp = workExperiences.value[expIndex]
  if (!exp || !exp.achievements) return
  exp.achievements.splice(achIndex, 1)
}

</script>

