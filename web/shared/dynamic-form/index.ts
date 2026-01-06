// Main exports
export { default as DynamicForm } from './components/DynamicForm.vue'
export { default as DynamicFormField } from './components/DynamicFormField.vue'

// Registry
export { fieldRegistry } from './registry/field-registry'

// Types
export type * from './types'

// Utils
export { parseSchema, unwrapSchema, getFieldType } from './utils/schema-parser'
export { getFormValue, setFormValue, getInitialValues } from './utils/form-helpers'

// Composables
export { useDynamicForm, useDynamicFormField } from './composables/useDynamicForm'

// Field components (for direct use if needed)
export { default as DynamicFormFieldInput } from './components/fields/DynamicFormFieldInput.vue'
export { default as DynamicFormFieldNumber } from './components/fields/DynamicFormFieldNumber.vue'
export { default as DynamicFormFieldTextarea } from './components/fields/DynamicFormFieldTextarea.vue'
export { default as DynamicFormFieldSelect } from './components/fields/DynamicFormFieldSelect.vue'
export { default as DynamicFormFieldCheckbox } from './components/fields/DynamicFormFieldCheckbox.vue'
export { default as DynamicFormFieldDate } from './components/fields/DynamicFormFieldDate.vue'
export { default as DynamicFormFieldRadio } from './components/fields/DynamicFormFieldRadio.vue'
export { default as DynamicFormFieldSwitch } from './components/fields/DynamicFormFieldSwitch.vue'

// Register default field components
// This runs at module load time to ensure fields are always registered
import { fieldRegistry } from './registry/field-registry'
import { getBaseType, getBaseSchema } from './utils/zod-utils'
import type { z } from 'zod'
import DynamicFormFieldInput from './components/fields/DynamicFormFieldInput.vue'
import DynamicFormFieldNumber from './components/fields/DynamicFormFieldNumber.vue'
import DynamicFormFieldTextarea from './components/fields/DynamicFormFieldTextarea.vue'
import DynamicFormFieldSelect from './components/fields/DynamicFormFieldSelect.vue'
import DynamicFormFieldCheckbox from './components/fields/DynamicFormFieldCheckbox.vue'
import DynamicFormFieldDate from './components/fields/DynamicFormFieldDate.vue'
import DynamicFormFieldRadio from './components/fields/DynamicFormFieldRadio.vue'
import DynamicFormFieldSwitch from './components/fields/DynamicFormFieldSwitch.vue'

// Ensure registration only happens once
let isRegistered = false

// Helper to unwrap zod item for supportsType checks
function unwrapForTypeCheck(zodItem: z.ZodAny): z.ZodAny {
  const typeName = zodItem._def?.typeName
  if (typeName === 'ZodOptional' || typeName === 'ZodNullable' || typeName === 'ZodDefault') {
    return zodItem._def.innerType ? unwrapForTypeCheck(zodItem._def.innerType) : zodItem
  }
  if (typeName === 'ZodEffects') {
    return zodItem._def.schema ? unwrapForTypeCheck(zodItem._def.schema) : zodItem
  }
  return zodItem
}

// Register default fields
fieldRegistry.register('input', {
  component: DynamicFormFieldInput,
  supportsType: (zodItem: z.ZodAny) => {
    const unwrapped = unwrapForTypeCheck(zodItem)
    return getBaseType(unwrapped) === 'string'
  }
})

fieldRegistry.register('number', {
  component: DynamicFormFieldNumber,
  supportsType: (zodItem: z.ZodAny) => {
    const unwrapped = unwrapForTypeCheck(zodItem)
    return getBaseType(unwrapped) === 'number'
  }
})

fieldRegistry.register('textarea', {
  component: DynamicFormFieldTextarea,
  supportsType: (zodItem: z.ZodAny) => {
    const unwrapped = unwrapForTypeCheck(zodItem)
    const type = getBaseType(unwrapped)
    if (type !== 'string') return false
    // Check if it's a long text field (has min check > 50)
    const baseSchema = getBaseSchema(unwrapped)
    const checks = baseSchema._def?.checks || []
    return checks.some((check: any) => check.kind === 'min' && check.value > 50)
  }
})

fieldRegistry.register('select', {
  component: DynamicFormFieldSelect,
  supportsType: (zodItem: z.ZodAny) => {
    const unwrapped = unwrapForTypeCheck(zodItem)
    return getBaseType(unwrapped) === 'enum'
  }
})

fieldRegistry.register('checkbox', {
  component: DynamicFormFieldCheckbox,
  supportsType: (zodItem: z.ZodAny) => {
    const unwrapped = unwrapForTypeCheck(zodItem)
    return getBaseType(unwrapped) === 'boolean'
  }
})

fieldRegistry.register('date', {
  component: DynamicFormFieldDate,
  supportsType: (zodItem: z.ZodAny) => {
    const unwrapped = unwrapForTypeCheck(zodItem)
    return getBaseType(unwrapped) === 'date'
  }
})

fieldRegistry.register('radio', {
  component: DynamicFormFieldRadio,
  supportsType: (zodItem: z.ZodAny) => {
    const unwrapped = unwrapForTypeCheck(zodItem)
    return getBaseType(unwrapped) === 'enum'
  }
})

fieldRegistry.register('switch', {
  component: DynamicFormFieldSwitch,
  supportsType: (zodItem: z.ZodAny) => {
    const unwrapped = unwrapForTypeCheck(zodItem)
    return getBaseType(unwrapped) === 'boolean'
  }
})

fieldRegistry.register('toggle', {
  component: DynamicFormFieldSwitch,
  supportsType: (zodItem: z.ZodAny) => {
    const unwrapped = unwrapForTypeCheck(zodItem)
    return getBaseType(unwrapped) === 'boolean'
  }
})

isRegistered = true

// Debug: log registration
if (import.meta.client) {
  console.log('[DynamicForm] Field registry initialized', {
    registeredFields: Array.from(fieldRegistry.getAll().keys()),
    count: fieldRegistry.getAll().size
  })
}

