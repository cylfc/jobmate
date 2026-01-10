/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Ref } from "vue";
import { ref, provide, inject, computed } from "vue";
import {
  getFormValue,
  setFormValue,
} from "@shared/dynamic-form/utils/form-helpers";

/**
 * Composable for DynamicForm component
 */
export function useDynamicForm(formState?: Ref<Record<string, unknown>>) {
  const internalState = ref<Record<string, unknown>>({});
  const state = formState || internalState;

  const getValue = (path: string): unknown => {
    return getFormValue(state.value, path);
  };

  const setValue = (path: string, value: unknown): void => {
    setFormValue(state.value, path, value);
  };

  // Provide for child components
  provide("formState", state);
  provide("getFormValue", getValue);
  provide("setFormValue", setValue);

  return {
    state,
    getValue,
    setValue,
  };
}

/**
 * Composable for field components to access form state
 */
export function useDynamicFormField(fieldName: string) {
  const formState = inject<Ref<Record<string, unknown>>>("formState");
  const getFormValue = inject<(path: string) => unknown>("getFormValue");
  const setFormValue =
    inject<(path: string, value: unknown) => void>("setFormValue");

  const fieldValue = computed({
    get: () => {
      if (!formState?.value) return undefined;
      if (getFormValue) return getFormValue(fieldName);
      // Fallback to direct access
      const keys = fieldName.split(".");
      let value: unknown = formState.value;
      for (const key of keys) {
        if (value === null || value === undefined) return undefined;
        if (typeof value !== "object") return undefined;
        value = (value as Record<string, unknown>)[key];
      }
      return value;
    },
    set: (value) => {
      if (!formState?.value) return;
      if (setFormValue) {
        setFormValue(fieldName, value);
      } else {
        // Fallback to direct set
        const keys = fieldName.split(".");
        const lastKey = keys.pop()!;
        let current: Record<string, unknown> = formState.value as Record<
          string,
          unknown
        >;
        for (const key of keys) {
          if (
            !(key in current) ||
            typeof current[key] !== "object" ||
            current[key] === null
          ) {
            current[key] = {};
          }
          current = current[key] as Record<string, unknown>;
        }
        current[lastKey] = value;
      }
    },
  });

  return {
    fieldValue,
  };
}
