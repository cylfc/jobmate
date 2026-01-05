<script setup lang="ts">
  import type { FieldProps } from '@shared/types/auto-form'
  import { computed } from 'vue'
  import { useAutoFormField } from '@shared/composables/useAutoFormField'
  
  const props = defineProps<FieldProps>()
  
  const { fieldValue } = useAutoFormField(props.fieldName)
  
  // Support showLabel in inputProps (if false, hide label)
  // Backward compatibility: also check hideLabel at top level
  const shouldShowLabel = computed(() => {
    if (props.config?.hideLabel) return false // Deprecated but still supported
    if (props.config?.inputProps?.showLabel === false) return false
    return true
  })
  
  // Filter out showLabel from inputProps before passing to textarea
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
      <UTextarea
        v-model="fieldValue"
        :id="fieldName"
        :name="fieldName"
        :placeholder="config?.placeholder"
        :disabled="disabled || config?.disabled"
        :rows="3"
        v-bind="inputProps"
        class="w-full"
      />
    </UFormField>
  </template>