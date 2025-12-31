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
                  :options="skillTypeOptions"
                  :placeholder="t('candidate.create.skills.type-placeholder', { defaultValue: 'Select type' })"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div v-if="skill.skillType === 'language'" class="grid grid-cols-2 gap-4">
              <UFormField :label="t('candidate.create.skills.level', { defaultValue: 'Level' })" name="level" class="w-full">
                <USelectMenu
                  v-model="skill.level"
                  :options="levelOptions"
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

const { t } = useI18n()

interface Props {
  modelValue: SkillEntry[]
}

interface Emits {
  (e: 'update:modelValue', value: SkillEntry[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const skills = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const skillTypeOptions = [
  { label: 'Technical', value: 'technical' },
  { label: 'Language', value: 'language' },
  { label: 'Soft Skill', value: 'soft' },
  { label: 'Certification', value: 'certification' },
]

const levelOptions = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' },
  { label: 'Native', value: 'native' },
]

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

