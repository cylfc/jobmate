<script setup lang="ts">
  import type { DynamicFormFieldProps } from '../../types'
  import { computed } from 'vue'
  import { getEnumValues } from '../../utils/zod-utils'
  import { useDynamicFormField } from '../../composables/useDynamicForm'
  
  const props = defineProps<DynamicFormFieldProps>()
  
  const { fieldValue } = useDynamicFormField(props.fieldName)
  
  const options = computed(() => {
    const enumValues = getEnumValues(props.zodItem)
    // Support custom options from componentProps
    if (props.config?.componentProps?.options) {
      return props.config.componentProps.options
    }
    return enumValues.map(value => ({
      value,
      label: value
    }))
  })
  
  const shouldShowLabel = computed(() => {
    if (props.config?.hideLabel) return false
    return true
  })
  
  const orientation = computed(() => {
    return props.config?.orientation || 'vertical'
  })
  
  const inputProps = computed(() => {
    const { options: _, ...rest } = props.config?.componentProps || {}
    return rest
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
    <USelect
      v-model="fieldValue"
      :id="fieldName"
      :name="fieldName"
      :options="options"
      :placeholder="config?.placeholder || 'Select an option'"
      :disabled="disabled || config?.disabled"
      size="lg"
      v-bind="inputProps"
      class="w-full"
    />
  </UFormField>
</template>

