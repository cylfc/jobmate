<template>
  <div class="space-y-4">
    <UFormField :label="$t('chat.components.job-input.label')">
      <UTextarea
        v-model="jobText"
        :placeholder="$t('chat.components.job-input.placeholder')"
        :rows="8"
      />
    </UFormField>

    <div class="flex gap-2">
      <UButton
        color="primary"
        :disabled="!jobText.trim()"
        @click="handleSubmit"
      >
        {{ $t('chat.components.job-input.confirm') }}
      </UButton>
      <UButton
        variant="outline"
        @click="handleUseDatabase"
      >
        {{ $t('chat.components.job-input.select-database') }}
      </UButton>
    </div>

    <!-- Step action buttons -->
    <StepActionButtons
      :show-clear="true"
      :show-back="showBack"
      :clear-label="$t('chat.components.job-input.clear-content')"
      @clear="handleClear"
      @back="handleBack"
    />
  </div>
</template>

<script setup lang="ts">
import StepActionButtons from './step-action-buttons.vue'

interface Props {
  value?: string
  showBack?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  showBack: true,
})

const emit = defineEmits<{
  (e: 'update', data: { jobText?: string; useDatabase?: boolean }): void
  (e: 'clear'): void
  (e: 'back'): void
}>()

const jobText = ref(props.value)

const handleSubmit = () => {
  if (jobText.value.trim()) {
    emit('update', {
      jobText: jobText.value.trim(),
    })
  }
}

const handleUseDatabase = () => {
  emit('update', { useDatabase: true })
}

const handleClear = () => {
  jobText.value = ''
  emit('clear')
}

const handleBack = () => {
  emit('back')
}
</script>

