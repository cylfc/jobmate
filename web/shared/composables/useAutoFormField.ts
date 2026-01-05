import type { Ref } from 'vue'
import { computed, inject } from 'vue'
import { getNestedValue, setNestedValue } from '@shared/utils/auto-form'

/**
 * Composable to access and update form field values
 * Works with both controlled and uncontrolled forms via provide/inject
 */
export function useAutoFormField(fieldName: string) {
  const formState = inject<Ref<Record<string, any>>>('formState')
  const getFormValue = inject<(path: string) => any>('getFormValue')
  const setFormValue = inject<(path: string, value: any) => void>('setFormValue')

  const fieldValue = computed({
    get: () => {
      // Ensure consistent behavior between server and client
      // Return undefined if formState is not available (consistent default)
      if (!formState?.value) return undefined
      
      // Nếu có getFormValue helper, dùng nó (hỗ trợ nested paths)
      if (getFormValue) {
        return getFormValue(fieldName)
      }
      
      // Nếu không, dùng getNestedValue để support nested paths
      return getNestedValue(formState.value, fieldName)
    },
    set: (value) => {
      // Ensure formState exists before setting
      if (!formState?.value) return
      
      // Nếu có setFormValue helper, dùng nó (hỗ trợ nested paths)
      if (setFormValue) {
        setFormValue(fieldName, value)
      } else {
        // Nếu không, dùng setNestedValue để support nested paths
        setNestedValue(formState.value, fieldName, value)
      }
    }
  })

  return {
    fieldValue
  }
}

