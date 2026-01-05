<script setup lang="ts">
  import type { z } from 'zod'
  import type { FieldConfig, Dependency } from '@shared/types/auto-form'
  import { DependencyType } from '@shared/types/auto-form'
  import type { Ref } from 'vue'
  import { computed, inject } from 'vue'
  import { 
    getBaseSchema, 
    getBaseType, 
    isRequired, 
    beautifyObjectName,
    getDefaultValueInZodStack 
  } from '@shared/utils/auto-form'
  import { useAutoFormField } from '@shared/composables/useAutoFormField'
  import AutoFormFieldInput from './AutoFormFieldInput.vue'
  import AutoFormFieldTextarea from './AutoFormFieldTextarea.vue'
  import AutoFormFieldSelect from './AutoFormFieldSelect.vue'
  import AutoFormFieldRadio from './AutoFormFieldRadio.vue'
  import AutoFormFieldCheckbox from './AutoFormFieldCheckbox.vue'
  import AutoFormFieldToggle from './AutoFormFieldToggle.vue'
  import AutoFormFieldDate from './AutoFormFieldDate.vue'
  import AutoFormFieldObject from './AutoFormFieldObject.vue'
  import AutoFormFieldArray from './AutoFormFieldArray.vue'
  
  const props = defineProps<{
    fieldName: string
    zodItem: z.ZodAny
    fieldConfig?: FieldConfig<any>
    dependencies?: Dependency<any>[]
  }>()
  
  // Inject form state and helpers for dependency evaluation
  const formState = inject<Ref<Record<string, any>>>('formState')
  const getFormValue = inject<(path: string) => any>('getFormValue')
  const { fieldValue } = useAutoFormField(props.fieldName)
  
  const baseType = computed(() => getBaseType(props.zodItem))
  const baseSchema = computed(() => getBaseSchema(props.zodItem))
  
  const label = computed(() => {
    const config = props.fieldConfig?.[props.fieldName.split('.').pop()!]
    if (config?.label) return config.label
    
    const description = (props.zodItem._def as any)?.description
    if (description) return description
    
    return beautifyObjectName(props.fieldName.split('.').pop()!)
  })
  
  const description = computed(() => {
    const config = props.fieldConfig?.[props.fieldName.split('.').pop()!]
    return config?.description
  })
  
  // Handle REQUIRES dependency type
  const baseRequired = computed(() => isRequired(props.zodItem))
  const required = computed(() => {
    if (baseRequired.value) return true
    
    // Check if any dependency requires this field
    if (!props.dependencies || !getFormValue) return false
    
    return props.dependencies.some(dep => {
      if (dep.targetField !== props.fieldName) return false
      if (dep.type !== DependencyType.REQUIRES) return false
      
      const sourceValue = getFormValue(dep.sourceField)
      return dep.when(sourceValue, fieldValue.value)
    })
  })
  
  const config = computed(() => {
    const fieldKey = props.fieldName.split('.').pop()!
    return props.fieldConfig?.[fieldKey]
  })
  
  const fieldProps = computed(() => ({
    fieldName: props.fieldName,
    label: label.value,
    description: description.value,
    required: required.value,
    config: config.value,
    disabled: false,
    zodItem: props.zodItem
  }))
  
  // Handle dependencies - FIX CRITICAL BUG
  const isHidden = computed(() => {
    if (!props.dependencies || !getFormValue) return false
    
    return props.dependencies.some(dep => {
      if (dep.targetField !== props.fieldName) return false
      if (dep.type !== DependencyType.HIDES) return false
      
      // Get source field value and evaluate dependency
      const sourceValue = getFormValue(dep.sourceField)
      const targetValue = fieldValue.value
      return dep.when(sourceValue, targetValue)
    })
  })
  
  const isDisabled = computed(() => {
    if (!props.dependencies || !getFormValue) return false
    
    return props.dependencies.some(dep => {
      if (dep.targetField !== props.fieldName) return false
      if (dep.type !== DependencyType.DISABLES) return false
      
      // Get source field value and evaluate dependency
      const sourceValue = getFormValue(dep.sourceField)
      const targetValue = fieldValue.value
      return dep.when(sourceValue, targetValue)
    })
  })
  
  // Determine which component to render
  const fieldComponent = computed(() => {
    if (config.value?.component) {
      if (typeof config.value.component === 'string') {
        const componentMap: Record<string, any> = {
          'input': AutoFormFieldInput,
          'textarea': AutoFormFieldTextarea,
          'select': AutoFormFieldSelect,
          'radio': AutoFormFieldRadio,
          'checkbox': AutoFormFieldCheckbox,
          'toggle': AutoFormFieldToggle,
          'switch': AutoFormFieldToggle,
          'date': AutoFormFieldDate,
          'file': AutoFormFieldInput, // File will be handled via inputProps.type
          'array': AutoFormFieldArray,
          'object': AutoFormFieldObject,
        }
        return componentMap[config.value.component] || AutoFormFieldInput
      }
      return config.value.component
    }
  
    const type = baseType.value
    
    if (type === 'boolean') return AutoFormFieldCheckbox
    if (type === 'date') return AutoFormFieldDate
    if (type === 'enum') return AutoFormFieldSelect
    if (type === 'array') return AutoFormFieldArray
    if (type === 'object') return AutoFormFieldObject
    if (type === 'string') {
      const checks = baseSchema.value._def.checks || []
      for (const check of checks) {
        if (check.kind === 'min' && check.value > 50) return AutoFormFieldTextarea
      }
    }
    
    return AutoFormFieldInput
  })
  </script>
  
  <template>
    <component
      :is="fieldComponent"
      v-if="!isHidden"
      v-bind="fieldProps"
      :field-config="fieldConfig"
      :dependencies="dependencies"
      :disabled="isDisabled"
    >
      <slot />
    </component>
  </template>