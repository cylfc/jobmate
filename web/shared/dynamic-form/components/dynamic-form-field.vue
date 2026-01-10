<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FieldInfo, FieldConfigItem } from "@shared/dynamic-form/types";
import { computed } from "vue";
import { fieldRegistry } from "@shared/dynamic-form/registry/field-registry";
import { beautifyObjectName } from "@shared/dynamic-form/utils/zod-utils";

const props = defineProps<{
  fieldInfo: FieldInfo;
  config?: FieldConfigItem | string;
  formErrors?: any[];
}>();

// Normalize config (can be string or FieldConfigItem)
const normalizedConfig = computed<FieldConfigItem | undefined>(() => {
  if (typeof props.config === "string") {
    return { label: props.config };
  }
  return props.config;
});

// Get label from config or schema description or field name
const label = computed(() => {
  if (normalizedConfig.value?.label) return normalizedConfig.value.label;
  if (props.fieldInfo.description) return props.fieldInfo.description;
  return beautifyObjectName(props.fieldInfo.name);
});

// Get description from config
const description = computed(() => {
  return normalizedConfig.value?.description;
});

// Resolve field component
const fieldComponent = computed(() => {
  const fieldName = props.fieldInfo.name;
  const fieldType = props.fieldInfo.type;

  // Debug: log field info
  console.log(`[DynamicFormField] Resolving component for "${fieldName}"`, {
    type: fieldType,
    hasConfig: !!normalizedConfig.value,
    configComponent: normalizedConfig.value?.component,
    zodItemTypeName: props.fieldInfo.zodItem._def?.typeName,
  });

  // If config has explicit component, use it
  if (normalizedConfig.value?.component) {
    const component = fieldRegistry.resolve(
      props.fieldInfo.zodItem,
      normalizedConfig.value,
    );
    if (component) {
      console.log(
        `[DynamicFormField] Using config component for "${fieldName}"`,
        {
          component:
            typeof normalizedConfig.value.component === "string"
              ? normalizedConfig.value.component
              : "custom",
        },
      );
      return component;
    }
  }

  // Otherwise, try to resolve based on fieldInfo.type first (faster)
  // Then fallback to resolving from zodItem
  let component: Component | undefined;

  // Try using fieldInfo.type for quick lookup
  if (fieldType !== "unknown") {
    const typeMap: Record<string, string> = {
      string: "input",
      number: "number",
      boolean: "checkbox",
      date: "date",
      enum: "select",
      array: "array",
      object: "object",
    };

    const componentName = typeMap[fieldType];
    if (componentName) {
      const entry = fieldRegistry.get(componentName);
      if (entry) {
        console.log(
          `[DynamicFormField] Found component by type for "${fieldName}"`,
          {
            type: fieldType,
            componentName,
          },
        );
        component = entry.component;
      } else {
        console.warn(
          `DynamicFormField: Component "${componentName}" not found in registry for type "${fieldType}"`,
          {
            availableComponents: Array.from(fieldRegistry.getAll().keys()),
          },
        );
      }
    } else {
      console.warn(
        `DynamicFormField: No component mapping for type "${fieldType}"`,
        {
          fieldName,
          availableTypes: Object.keys(typeMap),
        },
      );
    }
  } else {
    console.warn(
      `DynamicFormField: Field type is "unknown" for "${fieldName}"`,
      {
        zodItemTypeName: props.fieldInfo.zodItem._def?.typeName,
        hasInnerType: !!props.fieldInfo.zodItem._def?.innerType,
        innerTypeName: props.fieldInfo.zodItem._def?.innerType?._def?.typeName,
      },
    );
  }

  // If not found by type, try full resolve from zodItem
  if (!component) {
    console.log(
      `[DynamicFormField] Trying full resolve from zodItem for "${fieldName}"`,
    );
    component = fieldRegistry.resolve(
      props.fieldInfo.zodItem,
      normalizedConfig.value,
    );
    if (component) {
      console.log(
        `[DynamicFormField] Found component via full resolve for "${fieldName}"`,
      );
    }
  }

  if (!component) {
    console.warn(
      `DynamicFormField: No component found for field "${fieldName}" with type "${fieldType}"`,
      {
        zodItem: props.fieldInfo.zodItem,
        type: fieldType,
        config: normalizedConfig.value,
        registrySize: fieldRegistry.getAll().size,
        availableComponents: Array.from(fieldRegistry.getAll().keys()),
      },
    );
    // Ultimate fallback: use input component
    const inputEntry = fieldRegistry.get("input");
    if (inputEntry) {
      console.warn(
        `DynamicFormField: Using input as fallback for "${fieldName}"`,
      );
      return inputEntry.component;
    }
  }

  return component;
});

// Get error for this field
const fieldError = computed(() => {
  if (!props.formErrors || !Array.isArray(props.formErrors)) return undefined;
  const error = props.formErrors.find(
    (e: { path: string; message: string }) => e.path === props.fieldInfo.name,
  );
  console.log(`[DynamicFormField] Error for "${props.fieldInfo.name}"`, {
    hasFormErrors: !!props.formErrors,
    formErrorsLength: props.formErrors?.length || 0,
    error: error?.message,
    allErrors: props.formErrors,
  });
  return error?.message;
});

// Prepare field props
const fieldProps = computed(() => {
  return {
    fieldName: props.fieldInfo.name,
    zodItem: props.fieldInfo.zodItem,
    config: normalizedConfig.value,
    required: props.fieldInfo.isRequired,
    label: label.value,
    description: description.value,
    disabled: normalizedConfig.value?.disabled || false,
    error: fieldError.value,
  };
});
</script>

<template>
  <component :is="fieldComponent" v-if="fieldComponent" v-bind="fieldProps" />
</template>
