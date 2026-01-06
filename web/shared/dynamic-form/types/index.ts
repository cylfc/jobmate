import type { z } from 'zod'
import type { Component } from 'vue'
import type { Ref } from 'vue'
import type { FormError } from '#ui/types'

// Schema type - support wrapped Zod objects
export type DynamicFormSchema<T extends z.ZodObject<any, any> = z.ZodObject<any, any>> = 
  | T
  | z.ZodOptional<T>
  | z.ZodNullable<T>
  | z.ZodDefault<T>
  | z.ZodEffects<T>

// Field config item
export interface FieldConfigItem {
  // Label & description
  label?: string
  description?: string
  placeholder?: string
  hint?: string
  help?: string
  
  // Component override
  component?: string | Component
  
  // Field props
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  orientation?: 'vertical' | 'horizontal'
  hideLabel?: boolean
  
  // Component-specific props (passed to field component)
  componentProps?: Record<string, any>
  
  // Custom validation message
  validationMessage?: string
}

// Field config map - support string shortcut for label
export type FieldConfig<T extends z.ZodObject<any, any>> = {
  [K in keyof z.infer<T>]?: FieldConfigItem | string
}

// Field registry entry
export interface FieldRegistryEntry {
  component: Component
  defaultProps?: Record<string, any>
  supportsType?: (zodType: z.ZodAny) => boolean
}

// Field registry type
export type FieldRegistry = Map<string, FieldRegistryEntry>

// Field info from parsed schema
export interface FieldInfo {
  name: string
  zodItem: z.ZodAny
  type: string
  isRequired: boolean
  defaultValue?: any
  description?: string
  enumValues?: string[]
  nestedFields?: FieldInfo[] // For objects/arrays
}

// DynamicForm props
export interface DynamicFormProps<T extends z.ZodObject<any, any>> {
  schema: DynamicFormSchema<T>
  config?: FieldConfig<T>
  fieldRegistry?: FieldRegistry
  formState?: Ref<Record<string, any>>
  class?: string
  // Nuxt UI Form props
  validateOnInput?: boolean
  validateOnBlur?: boolean
  validateOnChange?: boolean
  debounce?: number
}

// DynamicForm emits
export interface DynamicFormEmits<T extends z.ZodObject<any, any>> {
  (e: 'submit', data: z.infer<T>): void
  (e: 'error', errors: FormError[]): void
}

// Field component props
export interface DynamicFormFieldProps {
  fieldName: string
  zodItem: z.ZodAny
  config?: FieldConfigItem
  disabled?: boolean
  required?: boolean
  label?: string
  description?: string
  error?: string
}

