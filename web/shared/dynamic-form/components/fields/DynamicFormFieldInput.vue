<script setup lang="ts">
  import type { DynamicFormFieldProps } from '../../types'
  import { computed } from 'vue'
  import { zodToHtmlInputType } from '../../utils/zod-utils'
  import { useDynamicFormField } from '../../composables/useDynamicForm'
  
  const props = defineProps<DynamicFormFieldProps>()
  
  const { fieldValue } = useDynamicFormField(props.fieldName)
  
  const inputType = computed(() => {
    return props.config?.componentProps?.type || zodToHtmlInputType(props.zodItem) || 'text'
  })
  
  const shouldShowLabel = computed(() => {
    if (props.config?.hideLabel) return false
    return true
  })
  
  const orientation = computed(() => {
    return props.config?.orientation || 'vertical'
  })
  
  const inputProps = computed(() => {
    const { type: _, ...restProps } = props.config?.componentProps || {}
    return restProps
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
    <UInput
      :id="fieldName"
      v-model="fieldValue"
      :name="fieldName"
      :type="inputType"
      :placeholder="config?.placeholder"
      :disabled="disabled || config?.disabled"
      v-bind="inputProps"
      class="w-full"
    />
  </UFormField>
</template>

