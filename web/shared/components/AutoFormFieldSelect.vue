<script setup lang="ts">
  import type { FieldProps } from '@shared/types/auto-form'
  import { computed } from 'vue'
  import { getEnumValues } from '@shared/utils/auto-form'
  import { useAutoFormField } from '@shared/composables/useAutoFormField'
  
  const props = defineProps<FieldProps>()
  
  const { fieldValue } = useAutoFormField(props.fieldName)
  
  const options = computed(() => {
    const enumValues = getEnumValues(props.zodItem)
    return enumValues.map(value => ({
      value,
      label: value
    }))
  })
  
  // Support showLabel in inputProps
  const shouldShowLabel = computed(() => {
    if (props.config?.hideLabel) return false
    if (props.config?.inputProps?.showLabel === false) return false
    return true
  })
  
  const inputProps = computed(() => {
    const { showLabel, ...rest } = props.config?.inputProps || {}
    return rest
  })
  
  // Orientation: default to 'vertical', can be overridden by config
  const orientation = computed(() => {
    return props.config?.orientation || 'vertical'
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
        v-bind="inputProps"
        class="w-full"
      />
    </UFormField>
  </template>