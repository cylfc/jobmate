<script setup lang="ts">
  import type { FieldProps } from '@shared/types/auto-form'
  import type { z } from 'zod'
  import { computed } from 'vue'
  import AutoFormField from '@shared/components/AutoFormField.vue'
  
  const props = defineProps<FieldProps & { 
    fieldConfig?: any
    dependencies?: any[]
  }>()
  
  const objectSchema = computed(() => props.zodItem as z.ZodObject<any>)
  </script>
  
  <template>
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">{{ config?.label || label }}</h3>
        <p v-if="config?.description || description" class="text-sm text-gray-500 mt-1">
          {{ config?.description || description }}
        </p>
      </template>
      
      <div class="space-y-4">
        <AutoFormField
          v-for="(key) in Object.keys(objectSchema.shape)"
          :key="key"
          :field-name="`${fieldName}.${key}`"
          :zod-item="objectSchema.shape[key]"
          :field-config="fieldConfig"
          :dependencies="dependencies"
        />
      </div>
    </UCard>
  </template>