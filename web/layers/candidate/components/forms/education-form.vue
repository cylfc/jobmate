<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-md font-semibold">{{ t('candidate.create.education.title', { defaultValue: 'Education' }) }}</h4>
      <UButton
        color="primary"
        variant="outline"
        size="sm"
        icon="i-lucide-plus"
        @click="handleAdd"
      >
        {{ t('candidate.create.education.add', { defaultValue: 'Add Education' }) }}
      </UButton>
    </div>

    <div v-if="educations.length === 0" class="text-sm text-muted text-center py-4">
      {{ t('candidate.create.education.empty', { defaultValue: 'No education entries. Click "Add Education" to add one.' }) }}
    </div>

    <div
      v-for="(edu, index) in educations"
      :key="edu.id || index"
      class="bg-muted rounded-lg p-2 space-y-4"
    >
      <UCollapsible class="flex flex-col gap-2 w-full">
        <UButton
          class="group w-full p-0"
          :label="`${edu.institution}`"
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
                edu.institution ||
                t("candidate.create.education.entry", {
                  defaultValue: "Education Entry",
                })
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
                :label="
                  t('candidate.create.education.institution', {
                    defaultValue: 'Institution',
                  })
                "
                name="institution"
                required
                class="w-full"
              >
                <UInput
                  v-model="edu.institution"
                  :placeholder="
                    t('candidate.create.education.institution-placeholder', {
                      defaultValue: 'University name',
                    })
                  "
                  class="w-full"
                />
              </UFormField>

              <UFormField
                :label="
                  t('candidate.create.education.major', { defaultValue: 'Major' })
                "
                name="major"
                class="w-full"
              >
                <UInput
                  v-model="edu.major"
                  :placeholder="
                    t('candidate.create.education.major-placeholder', {
                      defaultValue: 'Computer Science',
                    })
                  "
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField
                :label="
                  t('candidate.create.education.degree-type', {
                    defaultValue: 'Degree Type',
                  })
                "
                name="degreeType"
                class="w-full"
              >
                <USelectMenu
                  v-model="edu.degreeType"
                  :options="degreeTypeOptions"
                  :placeholder="
                    t('candidate.create.education.degree-type-placeholder', {
                      defaultValue: 'Select degree type',
                    })
                  "
                  class="w-full"
                />
              </UFormField>

              <UFormField
                :label="
                  t('candidate.create.education.gpa', { defaultValue: 'GPA' })
                "
                name="gpa"
                class="w-full"
              >
                <div class="flex gap-2">
                  <UInput
                    v-model.number="edu.gpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    :placeholder="
                      t('candidate.create.education.gpa-placeholder', {
                        defaultValue: '3.8',
                      })
                    "
                    class="flex-1"
                  />
                  <USelectMenu
                    v-model.number="edu.gpaScale"
                    :options="gpaScaleOptions"
                    class="w-24"
                  />
                </div>
              </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <UFormField
                :label="
                  t('candidate.create.education.start-date', {
                    defaultValue: 'Start Date',
                  })
                "
                name="startDate"
                class="w-full"
              >
                <UInputDate
                  :ref="(el) => setDateInputRef(el, index, 'startDate')"
                  v-model="edu.startDate"
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
                        <UCalendar v-model="edu.startDate" class="p-2" />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </UFormField>

              <UFormField
                :label="
                  t('candidate.create.education.end-date', {
                    defaultValue: 'End Date',
                  })
                "
                name="endDate"
                class="w-full"
              >
                <UInputDate
                  :ref="(el) => setDateInputRef(el, index, 'endDate')"
                  v-model="edu.endDate"
                  class="w-full"
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
                        <UCalendar v-model="edu.endDate" class="p-2" />
                      </template>
                    </UPopover>
                  </template>
                </UInputDate>
              </UFormField>
            </div>

            <UFormField
              :label="
                t('candidate.create.education.description', {
                  defaultValue: 'Description',
                })
              "
              name="description"
              class="w-full"
            >
              <UTextarea
                v-model="edu.description"
                :rows="3"
                :placeholder="
                  t('candidate.create.education.description-placeholder', {
                    defaultValue: 'Additional details...',
                  })
                "
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
import type { EducationEntry } from '@candidate/types/candidate'

const { t } = useI18n()

interface Props {
  modelValue: EducationEntry[]
}

interface Emits {
  (e: 'update:modelValue', value: EducationEntry[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const educations = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const degreeTypeOptions = [
  { label: 'Bachelor', value: 'Bachelor' },
  { label: 'Master', value: 'Master' },
  { label: 'PhD', value: 'PhD' },
  { label: 'Diploma', value: 'Diploma' },
  { label: 'Certificate', value: 'Certificate' },
]

const gpaScaleOptions = [
  { label: '4.0', value: 4.0 },
  { label: '10.0', value: 10.0 },
]

const handleAdd = () => {
  educations.value.push({
    institution: '',
    major: '',
    degreeType: undefined,
    startDate: undefined,
    endDate: undefined,
    gpa: undefined,
    gpaScale: 4.0,
    description: undefined,
    orderIndex: educations.value.length,
  })
}

const handleRemove = (index: number) => {
  educations.value.splice(index, 1)
  // Update orderIndex
  educations.value.forEach((edu, idx) => {
    edu.orderIndex = idx
  })
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


</script>

