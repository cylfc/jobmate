<script setup lang="ts" generic="T extends z.ZodObject<any, any>">
  import type { z } from 'zod'
  import type { FieldConfig, Dependency, ZodObjectOrWrapped } from '@shared/types/auto-form'
  import type { FormSubmitEvent } from '#ui/types'
  import type { Ref } from 'vue'
  import { computed, reactive, watch, provide, ref } from 'vue'
  import { getDefaultValueInZodStack, unwrapZodObject, getNestedValue, setNestedValue, extractShape } from '@shared/utils/auto-form'
  import AutoFormField from '@shared/components/AutoFormField.vue'
  
  // Get form ref to access validate method
  const formRef = ref<any>(null)
  
  const props = defineProps<{
    schema: ZodObjectOrWrapped<T>
    fieldConfig?: FieldConfig<T>
    dependencies?: Dependency<T>[]
    formState?: Ref<Record<string, any>> // Optional controlled form state
    class?: string // CSS class for the form
  }>()
  
  const emit = defineEmits<{
    (e: 'submit', values: z.infer<T>): void
  }>()
  
  // Unwrap schema if needed
  const unwrappedSchema = computed(() => {
    const unwrapped = unwrapZodObject(props.schema)
    // Ensure it's a ZodObject
    if (unwrapped._def?.typeName === 'ZodObject') {
      return unwrapped as z.ZodObject<any>
    }
    // If not a ZodObject, return as is (shouldn't happen but fallback)
    return unwrapped as z.ZodObject<any>
  })
  
  // Generate initial values from schema defaults (recursive for nested objects/arrays)
  // IMPORTANT: Phải có tất cả keys từ schema, ngay cả khi undefined, để NuxtUI Form validate đúng
  const getInitialValues = (schema: z.ZodObject<any>): Record<string, any> => {
    const values: Record<string, any> = {}
    if (!schema || !schema.shape) return values
    
    const shape = schema.shape
    
    for (const key in shape) {
      const defaultValue = getDefaultValueInZodStack(shape[key])
      // Luôn set key, ngay cả khi undefined, để đảm bảo formState có đầy đủ keys cho validation
      values[key] = defaultValue !== undefined ? defaultValue : undefined
    }
    
    return values
  }
  
  // Use provided formState or create internal state
  // IMPORTANT: For hydration consistency, use ref of plain object (not reactive)
  // This ensures server and client render the same initial state
  const initialValues = getInitialValues(unwrappedSchema.value)
  
  // CRITICAL: Đảm bảo UForm và child components dùng cùng một reactive reference
  // Nếu có formState prop (Ref), dùng nó cho cả UForm và provide
  // Nếu không, tạo một ref từ plain object để đảm bảo hydration consistency
  // Using ref(plain object) instead of ref(reactive()) to avoid hydration mismatch
  const formStateRef = props.formState || ref({ ...initialValues })
  
  // NuxtUI Form cần ref hoặc reactive object
  const formStateForForm = formStateRef
  
  // Helper functions for nested value access
  const getFormValue = (path: string): any => {
    return getNestedValue(formStateRef.value, path)
  }
  
  const setFormValue = (path: string, value: any): void => {
    // Always update formStateRef.value directly for consistency
    // This works for both controlled and uncontrolled forms
    setNestedValue(formStateRef.value, path, value)
  }
  
  // Provide state and helpers to child components
  // formStateRef đã được tạo ở trên, dùng nó cho cả UForm và provide
  provide('formState', formStateRef)
  provide('getFormValue', getFormValue)
  provide('setFormValue', setFormValue)
  
  // Watch for schema changes to update defaults (only for uncontrolled form)
  if (!props.formState) {
    watch(() => unwrappedSchema.value, () => {
      const newDefaults = getInitialValues(unwrappedSchema.value)
      // Update formStateRef.value directly
      Object.assign(formStateRef.value, newDefaults)
    }, { deep: true })
  }
  
  // Get field keys from schema shape - use unwrappedSchema directly
  const fieldKeys = computed(() => {
    const schema = unwrappedSchema.value
    if (!schema || !schema.shape) {
      return []
    }
    return Object.keys(schema.shape)
  })
  
  // Get shapes for slot - use unwrappedSchema directly
  const shapes = computed(() => {
    const schema = unwrappedSchema.value
    if (!schema || !schema.shape) {
      return {}
    }
    return schema.shape
  })
  
  const onSubmit = async (event: FormSubmitEvent<any>) => {
    // According to NuxtUI docs, UForm should validate before @submit
    // However, we'll double-check with Zod to ensure data is valid
    // If validation fails, we should not emit submit
    
    // Use safeParse to validate with Zod schema
    const result = unwrappedSchema.value.safeParse(event.data)
    
    if (!result.success) {
      // Validation failed - don't emit submit
      // According to NuxtUI docs, errors should be automatically displayed
      // in UFormField components based on the 'name' prop
      // But we can manually set errors using formRef.setErrors() if needed
      
      if (formRef.value && result.error && result.error.issues && Array.isArray(result.error.issues)) {
        // Convert Zod errors to NuxtUI FormError format
        // Zod uses 'issues' not 'errors'
        // Format: { path: string, message: string }[]
        const formErrors = result.error.issues.map((issue: any) => ({
          path: (issue.path && Array.isArray(issue.path) ? issue.path.join('.') : issue.path?.[0]?.toString()) || '',
          message: issue.message || 'Validation error'
        }))
        
        // Set errors manually to ensure they're displayed
        formRef.value.setErrors(formErrors)
      }
      
      return // Don't emit submit when validation fails
    }
    
    // Validation passed - emit submit with validated data
    emit('submit', result.data)
  }
  
  const onError = (event: any) => {
    // NuxtUI Form triggers @error when validation fails
    // According to docs: "Errors are reported directly to the FormField component
    // based on the name or error-pattern prop"
    // This means errors should already be displayed in UFormField components
    // We don't need to do anything here, just prevent submit
    console.log('Form validation errors (onError):', event)
  }
  
  </script>
  
  <template>
    <UForm 
      ref="formRef"
      :schema="unwrappedSchema.value" 
      :state="formStateForForm"
      :class="props.class"
      @submit="onSubmit"
      @error="onError"
    >
      <div class="space-y-6">
        <AutoFormField
          v-for="key in fieldKeys"
          :key="key"
          :field-name="key"
          :zod-item="shapes[key]"
          :field-config="fieldConfig"
          :dependencies="dependencies"
        >
          <template #default="slotProps">
            <slot 
              :name="key" 
              v-bind="slotProps"
            >
              <!-- Default rendering is handled by AutoFormField -->
            </slot>
          </template>
        </AutoFormField>
        
        <!-- Default slot with shapes -->
        <slot :shapes="shapes" />
      </div>
    </UForm>
  </template>