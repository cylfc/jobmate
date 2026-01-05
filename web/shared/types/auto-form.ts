import type { z } from 'zod'
import type { Component } from 'vue'

// Support wrapped Zod objects (e.g., z.object().optional(), z.object().nullable())
export type ZodObjectOrWrapped<T extends z.ZodObject<any, any> = z.ZodObject<any, any>> = 
  | T
  | z.ZodOptional<T>
  | z.ZodNullable<T>
  | z.ZodDefault<T>
  | z.ZodEffects<T>

// Alias types for consistency with official API
export type ConfigItem = FieldConfigItem
export type Config<T extends z.ZodObject<any, any>> = FieldConfig<T>
export type Shape<T extends z.ZodObject<any, any>> = z.infer<T>

export type FieldConfigItem = {
  label?: string
  description?: string
  placeholder?: string
  hideLabel?: boolean // Deprecated: use inputProps.showLabel instead
  disabled?: boolean
  orientation?: 'vertical' | 'horizontal' // FormField orientation (default: 'vertical')
  hint?: string // Hint text next to label
  help?: string // Help text below form control
  component?: 'input' | 'textarea' | 'select' | 'checkbox' | 'switch' | 'date' | 'radio' | 'file' | Component
  inputProps?: Record<string, any> & {
    showLabel?: boolean // If false, hide the label
  }
}

export type FieldConfig<T extends z.ZodObject<any, any>> = {
  [K in keyof z.infer<T>]?: FieldConfigItem
}

export enum DependencyType {
  HIDES = 'hides',
  DISABLES = 'disables',
  REQUIRES = 'requires',
  SETS_OPTIONS = 'sets-options',
}

// Dependency với sourceField và targetField là string (support nested paths)
export type Dependency<T extends z.ZodObject<any, any> = z.ZodObject<any, any>> = {
  sourceField: string // e.g., 'age' or 'address.street'
  targetField: string // e.g., 'parentsAllowed' or 'address.zip'
  type: DependencyType
  when: (sourceValue: any, targetValue?: any) => boolean
  options?: string[] // For SETS_OPTIONS type
}

export type FieldProps = {
  fieldName: string
  label?: string
  description?: string
  required: boolean
  config?: FieldConfigItem
  disabled?: boolean
  zodItem: z.ZodAny
}