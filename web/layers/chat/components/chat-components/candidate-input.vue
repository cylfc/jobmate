<template>
  <div class="space-y-4">
    <UFormField :label="$t('chat.components.candidate-input.label')">
      <UTextarea
        v-model="candidateText"
        :placeholder="$t('chat.components.candidate-input.placeholder')"
        :rows="8"
      />
    </UFormField>

    <div class="flex gap-2">
      <UButton
        color="primary"
        :disabled="!candidateText.trim()"
        @click="handleSubmit"
      >
        {{ $t('chat.components.candidate-input.confirm') }}
      </UButton>
      <UButton
        variant="outline"
        @click="handleUseDatabase"
      >
        {{ $t('chat.components.candidate-input.select-database') }}
      </UButton>
    </div>

    <!-- Step action buttons -->
    <StepActionButtons
      :show-clear="true"
      :show-back="showBack"
      :clear-label="$t('chat.components.candidate-input.clear-content')"
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
  (e: 'update', data: { candidateText?: string; useDatabase?: boolean }): void
  (e: 'clear'): void
  (e: 'back'): void
}>()

const candidateText = ref(props.value)

const handleSubmit = () => {
  if (candidateText.value.trim()) {
    emit('update', {
      candidateText: candidateText.value.trim(),
    })
  }
}

const handleUseDatabase = () => {
  emit('update', { useDatabase: true })
}

const handleClear = () => {
  candidateText.value = ''
  emit('clear')
}

const handleBack = () => {
  emit('back')
}
</script>

