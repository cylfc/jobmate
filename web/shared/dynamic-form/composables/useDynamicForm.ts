import type { Ref } from 'vue'
import { ref, provide, inject, computed } from 'vue'
import { getFormValue, setFormValue } from '@shared/dynamic-form/utils/form-helpers'

/**
 * Composable for DynamicForm component
 */
export function useDynamicForm(formState?: Ref<Record<string, any>>) {
  const internalState = ref<Record<string, any>>({})
  const state = formState || internalState
  
  const getValue = (path: string): any => {
    return getFormValue(state.value, path)
  }
  
  const setValue = (path: string, value: any): void => {
    setFormValue(state.value, path, value)
  }
  
  // Provide for child components
  provide('formState', state)
  provide('getFormValue', getValue)
  provide('setFormValue', setValue)
  
  return {
    state,
    getValue,
    setValue
  }
}

/**
 * Composable for field components to access form state
 */
export function useDynamicFormField(fieldName: string) {
  const formState = inject<Ref<Record<string, any>>>('formState')
  const getFormValue = inject<(path: string) => any>('getFormValue')
  const setFormValue = inject<(path: string, value: any) => void>('setFormValue')
  
  const fieldValue = computed({
    get: () => {
      if (!formState?.value) return undefined
      if (getFormValue) return getFormValue(fieldName)
      // Fallback to direct access
      const keys = fieldName.split('.')
      let value: any = formState.value
      for (const key of keys) {
        if (value === null || value === undefined) return undefined
        value = value[key]
      }
      return value
    },
    set: (value) => {
      if (!formState?.value) return
      if (setFormValue) {
        setFormValue(fieldName, value)
      } else {
        // Fallback to direct set
        const keys = fieldName.split('.')
        const lastKey = keys.pop()!
        let current: any = formState.value
        for (const key of keys) {
          if (!(key in current) || typeof current[key] !== 'object' || current[key] === null) {
            current[key] = {}
          }
          current = current[key]
        }
        current[lastKey] = value
      }
    }
  })
  
  return {
    fieldValue
  }
}

