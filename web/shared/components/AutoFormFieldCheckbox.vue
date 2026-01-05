<script setup lang="ts">
  import type { FieldProps } from '@shared/types/auto-form'
  import { computed } from 'vue'
  import { useAutoFormField } from '@shared/composables/useAutoFormField'
  
  const props = defineProps<FieldProps>()
  
  const { fieldValue } = useAutoFormField(props.fieldName)
  
  // Orientation: default to 'vertical', can be overridden by config
  const orientation = computed(() => {
    return props.config?.orientation || 'vertical'
  })
  
  // Filter out showLabel from inputProps
  const inputProps = computed(() => {
    const { showLabel, ...rest } = props.config?.inputProps || {}
    return rest
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