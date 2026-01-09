<script setup lang="ts">
  import type { DynamicFormFieldProps } from '@shared/dynamic-form/types'
  import { computed } from 'vue'
  import { useDynamicFormField } from '@shared/dynamic-form/composables/useDynamicForm'
  
  const props = defineProps<DynamicFormFieldProps>()
  
  const { fieldValue } = useDynamicFormField(props.fieldName)
  
  const shouldShowLabel = computed(() => {
    if (props.config?.hideLabel) return false
    return true
  })
  
  const orientation = computed(() => {
    return props.config?.orientation || 'vertical'
  })
  
  const inputProps = computed(() => {
    return props.config?.componentProps || {}
  })
</script>

<template>
  <UFormField 
    :name="fieldName"
    :label="shouldShowLabel ? (config?.label || label) : undefined" 
    :description="config?.description || description"
    :hint="config?.hint"
    :help="config?.help"
    :required="required"
    :orientation="orientation"
  >
    <UTextarea
      :id="fieldName"
      v-model="fieldValue"
      :name="fieldName"
      :placeholder="config?.placeholder"
      :disabled="disabled || config?.disabled"
      :rows="3"
      size="lg"
      v-bind="inputProps"
      class="w-full"
    />
  </UFormField>
</template>

