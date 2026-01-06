<script setup lang="ts">
  import type { DynamicFormFieldProps } from '../../types'
  import { computed } from 'vue'
  import { useDynamicFormField } from '../../composables/useDynamicForm'
  
  const props = defineProps<DynamicFormFieldProps>()
  
  const { fieldValue } = useDynamicFormField(props.fieldName)
  
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
    :label="config?.label || label" 
    :description="config?.description || description"
    :hint="config?.hint"
    :help="config?.help"
    :required="required"
    :orientation="orientation"
  >
    <UCheckbox
      v-model="fieldValue"
      :id="fieldName"
      :name="fieldName"
      :disabled="disabled || config?.disabled"
      v-bind="inputProps"
    />
  </UFormField>
</template>

