<script setup lang="ts">
  import type { FieldProps } from '@shared/types/auto-form'
  import type { z } from 'zod'
  import { computed } from 'vue'
  import { getBaseSchema } from '@shared/utils/auto-form'
  import { useAutoFormField } from '@shared/composables/useAutoFormField'
  
  const props = defineProps<FieldProps & {
    fieldConfig?: any
    dependencies?: any[]
  }>()
  
  const { fieldValue } = useAutoFormField(props.fieldName)
  
  const itemSchema = computed(() => {
    const arraySchema = getBaseSchema(props.zodItem) as z.ZodArray<any>
    return arraySchema._def.type
  })
  
  const items = computed(() => {
    if (!Array.isArray(fieldValue.value)) {
      fieldValue.value = []
    }
    return fieldValue.value
  })
  
  const addItem = () => {
    if (!Array.isArray(fieldValue.value)) {
      fieldValue.value = []
    }
    fieldValue.value = [...fieldValue.value, {}]
  }
  
  const removeItem = (index: number) => {
    if (Array.isArray(fieldValue.value)) {
      fieldValue.value = fieldValue.value.filter((_, i) => i !== index)
    }
  }
  </script>
  
  <template>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-semibold">{{ config?.label || label }}</h3>
            <p v-if="config?.description || description" class="text-sm text-gray-500 mt-1">
              {{ config?.description || description }}
            </p>
          </div>
          <UButton icon="i-heroicons-plus" size="sm" @click="addItem">Add</UButton>
        </div>
      </template>
      
      <div class="space-y-4">
        <UCard v-for="(item, index) in items" :key="index">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="font-medium">Item {{ index + 1 }}</span>
              <UButton 
                icon="i-heroicons-trash" 
                color="red" 
                variant="ghost"
                size="sm"
                @click="removeItem(index)"
              />
            </div>
          </template>
          
          <div class="space-y-4">
            <AutoFormField
              v-for="(key) in Object.keys(itemSchema.shape)"
              :key="`${index}-${key}`"
              :field-name="`${fieldName}[${index}].${key}`"
              :zod-item="itemSchema.shape[key]"
              :field-config="fieldConfig"
              :dependencies="dependencies"
            />
          </div>
        </UCard>
        
        <div v-if="items.length === 0" class="text-center py-8 text-gray-500">
          No items yet. Click "Add" to create one.
        </div>
      </div>
    </UCard>
  </template>