<script setup lang="ts" generic="T extends z.ZodObject<any, any>">
  import type { z } from 'zod'
  import type { DynamicFormProps, DynamicFormEmits, FieldConfig } from '../types'
  import type { FormSubmitEvent } from '#ui/types'
  import { computed, ref, watch, nextTick } from 'vue'
  import { parseSchema, unwrapSchema } from '../utils/schema-parser'
  import { useDynamicForm } from '../composables/useDynamicForm'
  import { getInitialValues } from '../utils/form-helpers'
  import DynamicFormField from './DynamicFormField.vue'
  import { fieldRegistry } from '../registry/field-registry'
  
  const props = defineProps<DynamicFormProps<T>>()
  const emit = defineEmits<DynamicFormEmits<T>>()
  
  const formRef = ref<any>(null)
  
  // Unwrap schema
  const unwrappedSchema = computed(() => unwrapSchema(props.schema))
  
  // Parse schema to get field info
  const fields = computed(() => {
    const parsed = parseSchema(unwrappedSchema.value)
    
    // Debug: log parsed fields
    console.log('[DynamicForm] Parsed fields:', parsed.map(f => ({
      name: f.name,
      type: f.type,
      isRequired: f.isRequired,
      zodItemTypeName: f.zodItem._def?.typeName
    })))
    
    // Debug: log fields if empty
    if (parsed.length === 0 && unwrappedSchema.value) {
      console.warn('[DynamicForm] No fields parsed from schema', {
        schema: unwrappedSchema.value,
        hasShape: !!unwrappedSchema.value.shape
      })
    }
    return parsed
  })
  
  // Initialize form state with defaults
  // IMPORTANT: For hydration consistency, use ref of plain object (not reactive)
  // This ensures server and client render the same initial state
  const initialValues = getInitialValues(unwrappedSchema.value)
  
  // CRITICAL: Đảm bảo UForm và child components dùng cùng một reactive reference
  // Nếu có formState prop (Ref), dùng nó cho cả UForm và provide
  // Nếu không, tạo một ref từ plain object để đảm bảo hydration consistency
  const formStateRef = props.formState || ref<Record<string, any>>({ ...initialValues })
  
  // Watch for schema changes to update initial values (only for uncontrolled form)
  if (!props.formState) {
    watch(() => unwrappedSchema.value, (newSchema) => {
      if (newSchema) {
        const newDefaults = getInitialValues(newSchema)
        Object.assign(formStateRef.value, newDefaults)
      }
    }, { deep: true })
  }
  
  // NuxtUI Form cần ref hoặc reactive object
  const formStateForForm = formStateRef
  
  // Provide state to child components
  const { state } = useDynamicForm(formStateRef)
  
  // Use provided registry or default
  const registry = computed(() => props.fieldRegistry || fieldRegistry)
  
  // Track form errors to force re-render of fields when errors change
  const formErrorsRef = ref<any[]>([])
  
  // Watch form errors to trigger re-render
  watch(() => formRef.value?.errors, (errors) => {
    if (errors) {
      formErrorsRef.value = errors
      console.log('[DynamicForm] Form errors changed:', errors)
    }
  }, { deep: true, immediate: true })
  
  // Normalize config - handle string shortcuts
  const normalizedConfig = computed<FieldConfig<T> | undefined>(() => {
    if (!props.config) return undefined
    
    const normalized: FieldConfig<T> = {}
    for (const key in props.config) {
      const value = props.config[key]
      if (typeof value === 'string') {
        normalized[key] = { label: value }
      } else {
        normalized[key] = value
      }
    }
    return normalized
  })
  
  // Handle submit
  const onSubmit = async (event: FormSubmitEvent<any>) => {
    // Prevent default form submission to handle validation manually
    event.preventDefault?.()
    
    // UForm already validates with schema automatically
    // We also validate with Zod to ensure consistency and get better error messages
    const result = unwrappedSchema.value.safeParse(event.data)
    
    console.log('[DynamicForm] onSubmit', {
      hasFormRef: !!formRef.value,
      hasSetErrors: typeof formRef.value?.setErrors === 'function',
      validationResult: result.success ? 'success' : 'failed',
      errorCount: result.success ? 0 : result.error?.issues?.length,
      eventData: event.data
    })
    
    if (!result.success) {
      // Validation failed - convert Zod errors to NuxtUI format and display them
      if (formRef.value && result.error?.issues) {
        // Convert Zod errors to NuxtUI FormError format
        // NuxtUI expects errors as array of { path: string, message: string }
        const errorsArray = result.error.issues.map((issue: any) => {
          // Get field path from Zod error - handle both array and single value paths
          let fieldPath = ''
          if (issue.path) {
            if (Array.isArray(issue.path)) {
              fieldPath = issue.path.join('.')
            } else if (typeof issue.path === 'string') {
              fieldPath = issue.path
            } else if (issue.path[0] !== undefined) {
              fieldPath = String(issue.path[0])
            }
          }
          
          return {
            path: fieldPath,
            message: issue.message || 'Validation error'
          }
        }).filter((err: any) => err.path) // Only include errors with valid paths
        
        console.log('[DynamicForm] Setting errors in onSubmit', errorsArray)
        console.log('[DynamicForm] Field names:', fields.value.map(f => f.name))
        console.log('[DynamicForm] Error paths:', errorsArray.map(e => e.path))
        console.log('[DynamicForm] Paths match:', errorsArray.every(err => 
          fields.value.some(f => f.name === err.path)
        ))
        
        // Set errors using NuxtUI's setErrors method to display them in UFormField components
        if (typeof formRef.value.setErrors === 'function') {
          // Set errors - UFormField will automatically display them based on name prop
          // IMPORTANT: Error paths must match field names exactly
          console.log('[DynamicForm] Calling setErrors with:', errorsArray)
          console.log('[DynamicForm] formRef.value before setErrors:', {
            errors: formRef.value.errors,
            hasErrors: !!formRef.value.errors,
            errorsLength: formRef.value.errors?.length || 0
          })
          
          formRef.value.setErrors(errorsArray)
          
          // Check immediately after setErrors
          console.log('[DynamicForm] formRef.value immediately after setErrors:', {
            errors: formRef.value.errors,
            hasErrors: !!formRef.value.errors,
            errorsLength: formRef.value.errors?.length || 0
          })
          
          // Wait for next tick to ensure errors are propagated
          await nextTick()
          
          // Wait another tick to ensure UFormField components have time to react
          await nextTick()
          
          // Debug: check if errors are still set after nextTick
          const currentErrors = formRef.value.errors || []
          console.log('[DynamicForm] Current form errors after nextTick', {
            errorCount: currentErrors.length,
            errors: currentErrors,
            errorsMatch: errorsArray.every(err => 
              currentErrors.some((ce: any) => ce.path === err.path)
            ),
            fieldNames: fields.value.map(f => f.name),
            errorPaths: errorsArray.map(e => e.path),
            formErrors: formRef.value.errors
          })
          
          // Force update formErrorsRef to trigger re-render
          formErrorsRef.value = [...(formRef.value.errors || [])]
          console.log('[DynamicForm] Updated formErrorsRef:', formErrorsRef.value)
        } else {
          console.warn('[DynamicForm] formRef.setErrors is not available')
        }
      }
      
      // Don't emit submit when validation fails
      // Errors are now displayed in the form fields
      emit('error', result.error.issues.map((issue: any) => ({
        path: Array.isArray(issue.path) ? issue.path.join('.') : String(issue.path[0] || ''),
        message: issue.message
      })))
      return
    }
    
    // Validation passed - emit submit with validated data
    emit('submit', result.data as z.infer<T>)
  }
  
  // Handle error event from UForm
  const onError = async (event: any) => {
    // NuxtUI Form triggers @error when validation fails
    // We validate with Zod to get better error messages and ensure consistency
    const result = unwrappedSchema.value.safeParse(formStateForForm.value)
    
    console.log('[DynamicForm] onError', {
      hasFormRef: !!formRef.value,
      hasSetErrors: typeof formRef.value?.setErrors === 'function',
      validationResult: result.success ? 'success' : 'failed',
      errorCount: result.success ? 0 : result.error?.issues?.length,
      eventErrors: event.errors
    })
    
    if (!result.success && formRef.value && result.error?.issues) {
      // Convert Zod errors to NuxtUI format and set them
      const errorsArray = result.error.issues.map((issue: any) => {
        let fieldPath = ''
        if (issue.path) {
          if (Array.isArray(issue.path)) {
            fieldPath = issue.path.join('.')
          } else if (typeof issue.path === 'string') {
            fieldPath = issue.path
          } else if (issue.path[0] !== undefined) {
            fieldPath = String(issue.path[0])
          }
        }
        
        return {
          path: fieldPath,
          message: issue.message || 'Validation error'
        }
      }).filter((err: any) => err.path)
      
      console.log('[DynamicForm] Setting errors in onError', errorsArray)
      console.log('[DynamicForm] Field names:', fields.value.map(f => f.name))
      
      // Set errors to ensure they're displayed
      if (typeof formRef.value.setErrors === 'function') {
        formRef.value.setErrors(errorsArray)
        
        // Wait for next tick to ensure errors are propagated
        await nextTick()
        
        // Debug: check if errors are actually set in form
        const currentErrors = formRef.value.errors || []
        console.log('[DynamicForm] Current form errors after setErrors in onError', {
          errorCount: currentErrors.length,
          errors: currentErrors,
          errorsMatch: errorsArray.every(err => 
            currentErrors.some((ce: any) => ce.path === err.path)
          ),
          fieldNames: fields.value.map(f => f.name),
          errorPaths: errorsArray.map(e => e.path)
        })
      }
      
      emit('error', errorsArray)
    } else if (event.errors && Array.isArray(event.errors)) {
      // Use errors from UForm if Zod validation passed but UForm has errors
      console.log('[DynamicForm] Using UForm errors', event.errors)
      emit('error', event.errors)
    }
  }
</script>

<template>
  <UForm
    ref="formRef"
    :schema="unwrappedSchema.value"
    :state="formStateForForm"
    :class="props.class"
    :validate-on-input="props.validateOnInput"
    :validate-on-blur="props.validateOnBlur"
    :validate-on-change="props.validateOnChange"
    :debounce="props.debounce"
    @submit.prevent="onSubmit"
    @error="onError"
  >
    <div class="space-y-6">
      <DynamicFormField
        v-for="field in fields"
        :key="`${field.name}-${formErrorsRef.length}`"
        :field-info="field"
        :config="normalizedConfig?.[field.name]"
        :form-errors="formErrorsRef"
      />
      
      <!-- Default slot -->
      <slot />
    </div>
  </UForm>
</template>

