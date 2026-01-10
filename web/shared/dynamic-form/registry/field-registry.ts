/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from "zod";
import type { Component } from "vue";
import type {
  FieldRegistry,
  FieldRegistryEntry,
} from "@shared/dynamic-form/types";
import { getBaseType } from "@shared/dynamic-form/utils/zod-utils";

class FieldRegistryManager {
  private registry: FieldRegistry = new Map();

  /**
   * Register a field component
   */
  register(name: string, entry: FieldRegistryEntry): void {
    this.registry.set(name, entry);
  }

  /**
   * Get field component by name
   */
  get(name: string): FieldRegistryEntry | undefined {
    return this.registry.get(name);
  }

  /**
   * Unwrap Zod schema to get base type
   */
  private unwrapZodItem(zodItem: z.ZodAny): z.ZodAny {
    const def = zodItem._def as any;
    const typeName = def?.typeName;

    // Unwrap wrapped types
    if (
      typeName === "ZodOptional" ||
      typeName === "ZodNullable" ||
      typeName === "ZodDefault"
    ) {
      const innerType = def.innerType;
      if (innerType) {
        return this.unwrapZodItem(innerType);
      }
    }

    if (typeName === "ZodEffects") {
      const innerType = def.schema;
      if (innerType) {
        return this.unwrapZodItem(innerType);
      }
    }

    return zodItem;
  }

  /**
   * Resolve field component for a Zod type
   */
  resolve(
    zodItem: z.ZodAny,
    config?: { component?: string | Component },
  ): Component | undefined {
    // 1. Check config.component first
    if (config?.component) {
      if (typeof config.component === "string") {
        const entry = this.get(config.component);
        if (entry) return entry.component;
      } else {
        return config.component;
      }
    }

    // 2. Unwrap zodItem before checking
    const unwrapped = this.unwrapZodItem(zodItem);

    // 3. Try to find by type matching
    for (const [, entry] of this.registry) {
      if (entry.supportsType && entry.supportsType(unwrapped)) {
        return entry.component;
      }
    }

    // 4. Fallback to default mapping
    return this.getDefaultComponent(unwrapped);
  }

  /**
   * Get default component for Zod type
   */
  private getDefaultComponent(zodItem: z.ZodAny): Component | undefined {
    const type = getBaseType(zodItem);
    const defaultMap: Record<string, string> = {
      string: "input",
      number: "number",
      boolean: "checkbox",
      date: "date",
      enum: "select",
      array: "array",
      object: "object",
    };

    const componentName = defaultMap[type];
    if (componentName) {
      const entry = this.get(componentName);
      if (entry) {
        return entry.component;
      }
    }

    // Fallback: if type is unknown, try to infer from zodItem structure
    if (type === "unknown") {
      const def = zodItem._def as any;
      console.warn("getDefaultComponent: Type is unknown, trying fallback", {
        typeName: def?.typeName,
        hasInnerType: !!def?.innerType,
        innerTypeName: def?.innerType?._def?.typeName,
      });

      // Try to get input as ultimate fallback
      const inputEntry = this.get("input");
      if (inputEntry) {
        return inputEntry.component;
      }
    }

    return undefined;
  }

  /**
   * Get all registered fields
   */
  getAll(): FieldRegistry {
    return this.registry;
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.registry.clear();
  }
}

// Singleton instance
export const fieldRegistry = new FieldRegistryManager();
